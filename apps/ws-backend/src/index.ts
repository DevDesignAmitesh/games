import { WebSocketServer } from "ws";
import { userManager } from "./userManager";
import { verifyToken } from "@repo/common/common";
import type { WebSocket } from "ws";
import type { GameResult, TokenPayload } from "@repo/types/types";
import { redisManager } from "@repo/redis/redis";
import { prisma, type BodmasGameUserAnswer } from "@repo/db/db";
import { bodmasgameManager } from "./gameManager";
import { generateRandomQuesions } from "./utils";
import { bullmqManager } from "@repo/bullmq/bullmq";

const server = new WebSocketServer({ port: 3002 });

type ExtendedWs = WebSocket & TokenPayload;

const allowedOrigins = [
  "http://localhost:3000",
  "https://games.amitesh.work",
];

server.on("connection", async (ws: ExtendedWs, req) => {
  const origin = req.headers.origin;

  if (!origin) {
    ws.close();
    return;
  }

  if (!allowedOrigins.includes(origin)) {
    console.log(`Connection denied from origin: ${origin}`);
    ws.close(1008, "Unauthorized"); // Close with a policy violation code
    return;
  }

  ws.on("error", console.error);

  const token = req.url?.split("?token=")[1];
  if (!token) return;
  console.log("token found");

  const decoded = verifyToken(token);
  if (!decoded) return;
  console.log("token decoded");

  const { userId } = decoded;

  const user = await prisma.user.findFirst({ where: { id: userId } });
  if (!user) return;
  console.log("user found");

  ws.userId = userId;

  const existingUser = userManager.users.find((usr) => usr.id === userId);

  if (!existingUser) {
    userManager.addUser({
      status: "IDOL",
      ws,
      id: userId,
      username: user.userName,
    });
    console.log("total users ", userManager.users.length);
  }

  await redisManager.subscribe("room:online_users");

  await redisManager.publish("room:online_users", {
    type: "online_users",
  });
  console.log("user subsribed and published");

  ws.on("message", async (data) => {
    let parsedData;

    try {
      parsedData = JSON.parse(data.toString());
    } catch (e) {
      return;
    }

    console.log("data from the client ", parsedData);

    if (parsedData.type === "ping") {
      ws.send(JSON.stringify({ status: "pong" }));
    }

    if (
      parsedData.type === "FRIEND_REQUEST_SEND" ||
      parsedData.type === "FRIEND_REQUEST_ACCEPT"
    ) {
      const { to } = parsedData.payload;

      const sender = userManager.users.find((usr) => usr.id === ws.userId);
      const receiver = userManager.users.find((usr) => usr.id === to);

      if (!receiver || !sender) return;

      await redisManager.publish(`room:user:${to}`, {
        type: parsedData.type,
        payload: {
          from: { name: sender.username, id: sender.id },
        },
      });
    }

    if (parsedData.type === "BODMAS_GAME_REQUEST") {
      const { gameId } = parsedData.payload;

      const requestedBy = userManager.users.find((usr) => usr.id === ws.userId);

      if (!requestedBy) return;

      const requestedByFromDb = await prisma.user.findFirst({
        where: { id: ws.userId },
        select: {
          userName: true,
          id: true,
        },
      });

      if (!requestedByFromDb) return;

      userManager.update(requestedBy.id, { status: "SEARCHING" });

      const bodmasGame = await prisma.bodmasGame.findFirst({
        where: { id: gameId },
      });

      if (!bodmasGame) return;

      if (bodmasGame.createdBy !== ws.userId) return;

      bodmasgameManager.create_update_game({
        ...bodmasGame,
        answers: [],
        questions: [],
        gameQuestions: [],
        players: [{ ...requestedBy, joinedAt: new Date() }],
        results: [],
      });

      await redisManager.subscribe(`room:game:${bodmasGame.id}`);

      await redisManager.publish("room:online_users", {
        type: parsedData.type,
        payload: {
          from: {
            name: requestedByFromDb.userName,
            id: requestedByFromDb.id,
          },
          gameId,
        },
      });
    }

    if (parsedData.type === "BODMAS_GAME_ACCEPT") {
      const { gameId, createdBy } = parsedData.payload;
      const key = `bodmas:game:${gameId}`;
      const value = `${ws.userId}:${Date.now()}`;
      const lock = await redisManager.lock(key, value);

      if (lock === 0) {
        ws.send(
          JSON.stringify({
            type: "GAME_IS_FULL",
          }),
        );
        return;
      }

      const acceptedBy = userManager.users.find((usr) => usr.id === ws.userId);
      const creator = userManager.users.find((usr) => usr.id === createdBy);
      const bodmasGame = bodmasgameManager.games.get(gameId);

      if (!acceptedBy || !creator || !bodmasGame) return;

      const bodmasGameFromDb = await prisma.bodmasGame.findFirst({
        where: { id: bodmasGame.id },
        include: { players: true },
      });

      if (!bodmasGameFromDb) return;

      if (bodmasGame.createdBy !== creator.id) return;

      if (
        bodmasGame.status === "CANCELLED" ||
        bodmasGame.status === "EXPIRED" ||
        bodmasGame.status === "COMPLETED"
      ) {
        return;
      }

      if (bodmasGameFromDb.players.length === 2) {
        ws.send(
          JSON.stringify({
            type: "GAME_IS_FULL",
          }),
        );
        return;
      }

      // idempotency ( already joined )
      if (bodmasGame.players.some((plr) => plr.id === ws.userId)) return;

      const gameStartTime = new Date();
      const gameEndTime = new Date(
        gameStartTime.valueOf() + bodmasGame.timeLimit * 1000 + 5000,
      ); // some buffer time while sync

      await bullmqManager.push("bodmas:game", {
        type: "BODMAS_GAME_ACCEPT",
        payload: {
          acceptedBy: acceptedBy.id,
          createdBy,
          gameId,
          startTime: gameStartTime,
          endTime: gameEndTime,
        },
      });

      userManager.update(createdBy, { status: "PLAYING" });
      userManager.update(acceptedBy.id, { status: "PLAYING" });

      bodmasgameManager.create_update_game({
        ...bodmasGame,
        startTime: gameStartTime,
        status: "IN_PROGRESS",
        endTime: gameEndTime,
        players: [
          ...bodmasGame.players,
          {
            ...acceptedBy,
            joinedAt: new Date(),
          },
        ],
      });

      const latestGame = bodmasgameManager.games.get(bodmasGame.id);
      if (!latestGame) return;

      await redisManager.subscribe(`room:game:${latestGame.id}`);

      const counter = bodmasgameManager.getQsCounter(gameId, ws.userId) || 0;
      bodmasgameManager.setQsCounter(gameId, ws.userId, counter);
      bodmasgameManager.setQsCounter(gameId, creator.id, counter);
      // this counter should be updated in db's game table

      const randomQuestions = generateRandomQuesions();
      bodmasgameManager.inmemoryQuestions.set(gameId, randomQuestions);
      // these questions should also be updated in db's questions table

      const questionStartTime = new Date(); // for buffer time
      const question = randomQuestions[counter];
      if (!question) return;
      bodmasgameManager.setQsTimer(
        question.id,
        ws.userId,
        questionStartTime.valueOf(),
      );

      bodmasgameManager.setQsTimer(
        question.id,
        creator.id,
        questionStartTime.valueOf(),
      );
      // this start time should also be updated in db's questions table

      latestGame.questions.push(question);
      latestGame.gameQuestions.push({
        gameId,
        orderIndex: counter,
        questionId: question.id,
        startTime: questionStartTime,
        userId: ws.userId,
      });
      // these questions are alread updated in db so on memory loss will get from the db

      await bullmqManager.push("bodmas:game", {
        type: "START_BODMAS_GAME",
        payload: {
          userId: ws.userId,
          gameId,
          gameQuestion: question,
          questionCounter: counter,
          questions: randomQuestions,
          questionStartTime,
          orderIndex: counter,
        },
      });

      await bullmqManager.push(
        "bodmas:game",
        {
          type: "TRACK_BODMAS_GAME",
          payload: { gameId },
        },
        bodmasGameFromDb.timeLimit * 1000 + 5000, // with some buffer time while syncing
      );

      await redisManager.publish(`room:game:${latestGame.id}`, {
        type: "BODMAS_GAME_ROUND_STARTED",
        payload: {
          question,
          gameId,
        },
      });

      await redisManager.publish(`room:game:${latestGame.id}`, {
        type: "BODMAS_GAME_DATA",
        payload: {
          players: latestGame.players,
          results: latestGame.results,
          endTime: latestGame.endTime,
          startTime: latestGame.startTime,
        },
      });
    }

    if (parsedData.type === "BODMAS_GAME_ANSWER") {
      const { gameId, questionId, answer } = parsedData.payload;

      const presentGame = bodmasgameManager.games.get(gameId);
      if (!presentGame) return;

      await redisManager.subscribe(`room:game:${gameId}`);

      console.log("present game ", presentGame.status);

      if (
        presentGame.status === "CANCELLED" ||
        presentGame.status === "EXPIRED" ||
        presentGame.status === "COMPLETED"
      ) {
        return;
      }

      const allQuestions = bodmasgameManager.inmemoryQuestions.get(
        presentGame.id,
      );
      if (!allQuestions || !allQuestions.length) return;

      console.log(1);

      const question = allQuestions.find((qs) => qs.id === questionId);
      if (!question) return;

      console.log(2);

      const startedAt = bodmasgameManager.getQsTimer(question.id, ws.userId);
      if (!startedAt) return;
      console.log(3);

      const timeSpent = Date.now() - startedAt;

      const isAnswerExists = presentGame.answers.find(
        (ans) => ans.questionId == question.id && ans.userId === ws.userId,
      );

      if (isAnswerExists) {
        const isCorrect = question.answer === Number(answer);

        const updatedAnswer: BodmasGameUserAnswer = {
          ...isAnswerExists,
          timeSpent,
          updatedAt: new Date(),
          answeredAt: new Date(),
          isCorrect,
        };

        if (isCorrect) bodmasgameManager.delQsTimer(question.id, ws.userId);

        const updatedAnswers = presentGame.answers.filter(
          (ans) => ans.id !== isAnswerExists.id,
        );

        await bullmqManager.push("bodmas:game", {
          type: "BODMAS_GAME_ANSWER",
          payload: {
            answer: updatedAnswer,
          },
        });

        presentGame.answers = [...updatedAnswers, updatedAnswer];
        if (!isCorrect) return;
      } else {
        const isCorrect = question.answer === Number(answer);

        const newAnswer: BodmasGameUserAnswer = {
          id: crypto.randomUUID(),
          questionId: question.id,
          answer,
          isCorrect,
          timeSpent,
          userId: ws.userId,
          gameId: presentGame.id,
          answeredAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        presentGame.answers.push(newAnswer);

        if (isCorrect) bodmasgameManager.delQsTimer(question.id, ws.userId);

        // create in the db via worker
        await bullmqManager.push("bodmas:game", {
          type: "BODMAS_GAME_ANSWER",
          payload: {
            answer: newAnswer,
          },
        });
        if (!isCorrect) return;
      }

      console.log(4);

      const index = presentGame.results.findIndex(
        (rsl) => rsl.gameId === gameId && rsl.userId === ws.userId,
      );

      if (index !== -1) {
        const isCorrect = question.answer === Number(answer);

        if (!presentGame.results[index]) {
          return;
        }

        presentGame.results[index] = {
          ...presentGame.results[index],
          correctAnswers: isCorrect
            ? presentGame.results[index]!.correctAnswers + 1
            : presentGame.results[index]!.correctAnswers,
          incorrectAnswers: isCorrect
            ? presentGame.results[index]!.incorrectAnswers
            : presentGame.results[index]!.incorrectAnswers + 1,
        };
      } else {
        const isCorrect = question.answer === Number(answer);

        presentGame.results.push({
          id: crypto.randomUUID(),
          correctAnswers: isCorrect ? 1 : 0,
          incorrectAnswers: isCorrect ? 0 : 1,
          gameId,
          userId: ws.userId,
        });
      }

      console.log(5);

      let counter = bodmasgameManager.getQsCounter(gameId, ws.userId);
      if (counter === undefined) return;

      counter += 1;

      bodmasgameManager.setQsCounter(gameId, ws.userId, counter);

      console.log(6);

      const nextQuestion = allQuestions[counter];
      if (!nextQuestion) return;

      const questionStartTime = new Date();
      bodmasgameManager.setQsTimer(
        nextQuestion.id,
        ws.userId,
        questionStartTime.valueOf(),
      );

      presentGame.questions.push(nextQuestion);
      presentGame.gameQuestions.push({
        gameId: presentGame.id,
        orderIndex: counter,
        questionId: nextQuestion.id,
        userId: user.id,
        startTime: questionStartTime,
      });

      console.log(7);

      await bullmqManager.push("bodmas:game", {
        type: "START_BODMAS_GAME",
        payload: {
          userId: ws.userId,
          gameId,
          questionCounter: counter,
          gameQuestion: nextQuestion,
          questionStartTime,
          orderIndex: counter,
        },
      });

      ws.send(
        JSON.stringify({
          type: "BODMAS_GAME_ROUND_STARTED",
          payload: {
            question: nextQuestion,
            gameId,
          },
        }),
      );

      await redisManager.publish(`room:game:${gameId}`, {
        type: "BODMAS_GAME_DATA",
        payload: {
          players: presentGame.players,
          results: presentGame.results,
          endTime: presentGame.endTime,
          startTime: presentGame.startTime,
        },
      });
    }
  });

  ws.on("close", async () => {
    console.log("removing user");
    userManager.removeUser(ws.userId);

    await redisManager.unsubscribe("room:online_users");

    await redisManager.publish("room:online_users", {
      type: "online_users",
    });
  });
});
