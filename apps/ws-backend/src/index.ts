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

server.on("connection", async (ws: ExtendedWs, req) => {
  ws.on("error", console.error);

  console.log("connection done");

  const token = req.url?.split("?token=")[1];
  if (!token) {
    ws.close();
    return;
  }

  const decoded = verifyToken(token);

  if (!decoded) return ws.close();

  const { userId } = decoded;

  const user = await prisma.user.findFirst({ where: { id: userId } });
  if (!user) {
    ws.close();
    return;
  }

  ws.userId = userId;
  userManager.addUser({
    status: "IDOL",
    ws,
    id: userId,
    username: user.userName,
  });

  redisManager.subscribe("online_users");

  redisManager.publish("online_users", {
    type: "online_users",
  });

  ws.on("ping", () => {
    ws.send(JSON.stringify({ status: "ok" }));
  });

    ws.on("message", async (data) => {
    let parsedData;

    try {
      parsedData = JSON.parse(data.toString());
    } catch (e) {
      console.log("parsing error ", e);
      return;
    }

    if (
      parsedData.type === "FRIEND_REQUEST_SEND" ||
      parsedData.type === "FRIEND_REQUEST_ACCEPT"
    ) {
      const { to } = parsedData.payload;

      const sender = userManager.users.find((usr) => usr.id === ws.userId);
      const receiver = userManager.users.find((usr) => usr.id === to);

      if (!receiver || !sender) return ws.close();

      redisManager.publish("online_users", {
        type: parsedData.type,
        to,
        from: { name: sender.username, id: sender.id },
      });
    }

    if (parsedData.type === "BODMAS_GAME_REQUEST") {
      const { gameId } = parsedData.payload;

      const requestedBy = userManager.users.find((usr) => usr.id === ws.userId);

      if (!requestedBy) return ws.close();

      const requestedByFromDb = await prisma.user.findFirst({
        where: { id: ws.userId },
        select: {
          userName: true,
          id: true,
        },
      });

      if (!requestedByFromDb) return ws.close();

      userManager.update(requestedBy.id, { status: "SEARCHING" });

      const bodmasGame = await prisma.bodmasGame.findFirst({
        where: { id: gameId },
      });

      if (!bodmasGame) return ws.close();

      bodmasgameManager.create_update_game({
        ...bodmasGame,
        answers: [],
        questions: [],
        players: [{ ...requestedBy, joinedAt: new Date() }],
      });

      redisManager.subscribe(`bodmas:game:${bodmasGame.id}`);

      redisManager.publish("online_users", {
        type: parsedData.type,
        from: {
          name: requestedByFromDb.userName,
          id: requestedByFromDb.id,
        },
        gameId,
      });
    }

    if (parsedData.type === "BODMAS_GAME_ACCEPT") {
      const { gameId, createdBy } = parsedData.payload;
      const key = `bodmas:game:${gameId}`;
      const lock = await redisManager.lock(key, `${ws.userId}:${Date.now()}`);

      console.log("lock ", lock);
      
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

      if (!acceptedBy || !creator || !bodmasGame) return ws.close();

      console.log("here-1")
      
      
      if (bodmasGame.createdBy !== creator.id) return;
      
      const bodmasGameFromDb = await prisma.bodmasGame.findFirst({
        where: { id: bodmasGame.id },
        include: { players: true },
      });
      console.log("here-2")
      
      if (!bodmasGameFromDb) {
        return ws.close();
      }
      
      if (bodmasGameFromDb.players.length === 2) {
        ws.send(
          JSON.stringify({
            type: "GAME_IS_FULL",
          }),
        );
        return;
      }
      
      console.log("here-3")
      // idempotency ( already joined )
      if (bodmasGame.players.some((plr) => plr.id === ws.userId)) return;
      
      bullmqManager.push("bodmas:game", {
        type: "BODMAS_GAME_ACCEPT",
        payload: {
          acceptedBy: acceptedBy.id,
          createdBy,
          gameId,
        },
      });

      userManager.update(createdBy, { status: "PLAYING" });
      userManager.update(acceptedBy.id, { status: "PLAYING" });
      console.log("here-4")
      
      bodmasgameManager.create_update_game({
        ...bodmasGame,
        startTime: new Date(),
        status: "IN_PROGRESS",
        players: [
          ...bodmasGame.players,
          { ...acceptedBy, joinedAt: new Date() },
        ],
      });
      
      redisManager.releaseLock(key);
      
      console.log("here-5")
      redisManager.subscribe(`bodmas:game:${bodmasGame.id}`);
      redisManager.publish(`bodmas:game:${bodmasGame.id}`, {
        type: "START_BODMAS_GAME",
      });
    }

    // todo: have to decide that who will send this event client or server and if client then only admin or everyone
    if (parsedData.type === "START_BODMAS_GAME") {
      const { gameId } = parsedData.payload;

      const bodmasGameFromDb = await prisma.bodmasGame.findFirst({
        where: { id: gameId },
      });
      if (!bodmasGameFromDb) return ws.close();

      const inmemoryBodmasGame = bodmasgameManager.games.get(gameId);
      if (!inmemoryBodmasGame) return ws.close();

      const counter = bodmasgameManager.getQsCounter(gameId, ws.userId) || 0;
      bodmasgameManager.setQsCounter(gameId, ws.userId, counter);
      // this counter should be updated in db's game table

      const randomQuestions = generateRandomQuesions();
      bodmasgameManager.inmemoryQuestions.set(gameId, randomQuestions);
      // these questions should also be updated in db's questions table

      const startTime = new Date();
      const question = randomQuestions[counter]!;
      bodmasgameManager.setQsTimer(question.id, ws.userId, startTime.valueOf());
      // this start time should also be updated in db's questions table

      inmemoryBodmasGame.questions.push(question);
      // these questions are alread updated in db so on memory loss will get from the db

      bullmqManager.push("bodmas:game", {
        type: "TRACK_BODMAS_GAME",
        payload: {
          gameId,
        },
      }, bodmasGameFromDb.timeLimit);

      bullmqManager.push("bodmas:game", {
        type: "START_BODMAS_GAME",
        payload: {
          userId: ws.userId,
          gameId,
          questionCounter: counter,
          questions: randomQuestions,
          questionStartTimeWithId: {
            id: question.id,
            startTime,
          },
        },
      });

      redisManager.publish(`bodmas:game:${inmemoryBodmasGame.id}`, {
        type: "BODMAS_GAME_ROUND_STARTED",
        question,
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

      const allQuestions = bodmasgameManager.inmemoryQuestions.get(game.id);
      if (!allQuestions || !allQuestions.length) return;

      const question = allQuestions.find((qs) => qs.id === questionId);
      if (!question) return;

      const startedAt = bodmasgameManager.getQsTimer(question.id, ws.userId);
      if (!startedAt) return;

      const timeSpent = Date.now() - startedAt;

      const isAnswerExists = presentGame.answers.find(
        (ans) => ans.questionId == question.id && ans.userId === ws.userId,
      );

      if (isAnswerExists) {
        let updatedAnswer: BodmasGameUserAnswer = {
          ...isAnswerExists,
          timeSpent,
          updatedAt: new Date(),
          answeredAt: new Date(),
        };

        if (question.answer !== Number(answer)) {
          updatedAnswer = {
            ...isAnswerExists,
            isCorrect: false,
          };
        } else {
          updatedAnswer = {
            ...isAnswerExists,
            isCorrect: true,
          };
          bodmasgameManager.delQsTimer(question.id, ws.userId);
        }

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

        presentGame.answers = [...updatedAnswers, updatedAnswer];

        if (question.answer !== Number(answer)) return;
      } else {
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
      if (!counter) return;

      counter += 1;

      bodmasgameManager.setQsCounter(gameId, ws.userId, counter);

      const nextQuestion = allQuestions[counter];
      if (!nextQuestion) return;

      bodmasgameManager.setQsTimer(nextQuestion.id, ws.userId, Date.now());

      redisManager.publish(`bodmas:game:${gameId}`, {
        type: "BODMAS_GAME_ROUND_STARTED",
        question: nextQuestion,
      });
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
