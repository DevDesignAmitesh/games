import { WebSocketServer } from "ws";
import { userManager } from "./userManager";
import { verifyToken } from "@repo/common/common";
import type { WebSocket } from "ws";
import type { TokenPayload } from "@repo/types/types";
import { redisManager } from "@repo/redis/redis";
import { prisma, type BodmasGameUserAnswer } from "@repo/db/db";
import { bodmasgameManager } from "./gameManager";
import { generateRandomQuesions } from "./utils";
import { bullmqManager } from "@repo/bullmq/bullmq";

const server = new WebSocketServer({ port: 8080 });

type ExtendedWs = WebSocket & TokenPayload;

redisManager.subscribe("online_users");

server.on("connection", async (ws: ExtendedWs, req) => {
  ws.on("error", console.error);

  const token = req.url?.split("?token=")[1];
  if (!token) return;
  
  const decoded = verifyToken(token);
  if (!decoded) return;

  const { userId } = decoded;

  const user = await prisma.user.findFirst({ where: { id: userId } });
  if (!user) return;

  ws.userId = userId;
  userManager.addUser({
    status: "IDOL",
    ws,
    id: userId,
    username: user.userName,
  });
    
  redisManager.publish("online_users", {
    type: "online_users",
  });
  
  console.log("connection done");

  ws.on("message", async (data) => {
    let parsedData;

    try {
      parsedData = JSON.parse(data.toString());
    } catch (e) {
      console.log("parsing error ", e);
      return;
    }

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

      redisManager.publish("online_users", {
        type: parsedData.type,
        payload: {
          to,
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
      });

      redisManager.subscribe(`bodmas:game:${bodmasGame.id}`);

      redisManager.publish("online_users", {
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

      const gameStartTime = new Date(); // some buffer time while sync
      const gameEndTime = new Date(
        gameStartTime.valueOf() + bodmasGame.timeLimit * 1000,
      ); // some buffer time while sync

      bullmqManager.push("bodmas:game", {
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
      console.log("here-4");

      bodmasgameManager.create_update_game({
        ...bodmasGame,
        startTime: gameStartTime,
        status: "IN_PROGRESS",
        endTime: gameEndTime,
        players: [
          ...bodmasGame.players,
          { ...acceptedBy, joinedAt: new Date() },
        ],
      });

      redisManager.releaseLock(key);

      redisManager.subscribe(`bodmas:game:${bodmasGame.id}`);

      const counter = bodmasgameManager.getQsCounter(gameId, ws.userId) || 0;
      bodmasgameManager.setQsCounter(gameId, ws.userId, counter);
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
      // this start time should also be updated in db's questions table

      bodmasGame.questions.push(question);
      bodmasGame.gameQuestions.push({
        gameId,
        orderIndex: counter,
        questionId: question.id,
        startTime: questionStartTime,
        userId: ws.userId,
      });
      // these questions are alread updated in db so on memory loss will get from the db

      bullmqManager.push("bodmas:game", {
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

      bullmqManager.push(
        "bodmas:game",
        {
          type: "TRACK_BODMAS_GAME",
          payload: { gameId },
        },
        bodmasGameFromDb.timeLimit * 1000 + 5000, // with some buffer time while syncing
      );

      redisManager.publish(`bodmas:game:${bodmasGame.id}`, {
        type: "BODMAS_GAME_ROUND_STARTED",
        payload: { question },
      });
    }

    if (parsedData.type === "BODMAS_GAME_ANSWER") {
      const { gameId, questionId, answer } = parsedData.payload;

      const game = await prisma.bodmasGame.findFirst({
        where: { id: gameId },
      });
      if (!game) return;

      const presentGame = bodmasgameManager.games.get(game.id);
      if (!presentGame) return;

      if (
        presentGame.status === "CANCELLED" ||
        presentGame.status === "EXPIRED" ||
        presentGame.status === "COMPLETED"
      ) {
        return;
      }

      console.log("both games found");

      const allQuestions = bodmasgameManager.inmemoryQuestions.get(game.id);
      console.log("allQuestions ", allQuestions);
      if (!allQuestions || !allQuestions.length) return;

      const question = allQuestions.find((qs) => qs.id === questionId);
      if (!question) return;

      console.log("all questions found");

      const startedAt = bodmasgameManager.getQsTimer(question.id, ws.userId);
      if (!startedAt) return;

      const timeSpent = Date.now() - startedAt;

      const isAnswerExists = presentGame.answers.find(
        (ans) => ans.questionId == question.id && ans.userId === ws.userId,
      );

      if (isAnswerExists) {
        console.log("answer already exists");
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

        // update the db via worker
        bullmqManager.push("bodmas:game", {
          type: "BODMAS_GAME_ANSWER",
          payload: {
            answer: updatedAnswer,
          },
        });

        console.log("pushing to worker for updating ");

        presentGame.answers = [...updatedAnswers, updatedAnswer];

        if (!isCorrect) return;
      } else {
        console.log("creating new answer");
        const isCorrect = question.answer === Number(answer);

        const newAnswer: BodmasGameUserAnswer = {
          id: crypto.randomUUID(),
          questionId: question.id,
          answer,
          isCorrect,
          timeSpent,
          userId: ws.userId,
          gameId: game.id,
          answeredAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        presentGame.answers.push(newAnswer);

        if (isCorrect) bodmasgameManager.delQsTimer(question.id, ws.userId);

        console.log("pushing in db");
        console.log("iscorrect ", isCorrect);
        // create in the db via worker
        bullmqManager.push("bodmas:game", {
          type: "BODMAS_GAME_ANSWER",
          payload: {
            answer: newAnswer,
          },
        });
        if (!isCorrect) return;
      }

      let counter = bodmasgameManager.getQsCounter(gameId, ws.userId);
      console.log("counter ", counter);
      if (counter === undefined) return;

      counter += 1;

      bodmasgameManager.setQsCounter(gameId, ws.userId, counter);

      const nextQuestion = allQuestions[counter];
      console.log("nextQuestion ", nextQuestion);
      if (!nextQuestion) return;

      console.log("increasing counter and getting next question");

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

      console.log("pushing to worker");

      bullmqManager.push("bodmas:game", {
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

      console.log("unicasting to the user");
      ws.send(
        JSON.stringify({
          type: "BODMAS_GAME_ROUND_STARTED",
          payload: { question: nextQuestion },
        }),
      );
    }
  });

  ws.on("close", () => {
    console.log("connection left");
    userManager.removeUser(userId);

    redisManager.unsubscribe();

    redisManager.publish("online_users", {
      type: "online_users",
    });
  });
});
