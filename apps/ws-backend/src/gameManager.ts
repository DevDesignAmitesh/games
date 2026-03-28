import type { BodmasQuestion } from "@repo/db/db";
import type { BoadMasGame } from "@repo/types/types";
import { getGamesFromDb } from "./utils";

class BodmasGameManager {
  private static instance: BodmasGameManager;

  // gameId, game with all the details (players, answers)
  games: Map<string, BoadMasGame>;

  // game id with all the questions
  inmemoryQuestions: Map<string, BodmasQuestion[]>;

  // gameId-userId and question index (for finding that which question to send now)
  questionCounter: Map<string, number>;

  // questionId-userId and answers at (for calculating the response from the user of a particular ques.)
  questionTiming: Map<string, number>;

  private constructor(games: BoadMasGame[]) {
    this.games = new Map(games.map((gm) => [gm.id, gm]));
    this.inmemoryQuestions = new Map(games.map((gm) => [gm.id, gm.questions]));
    this.questionCounter = new Map(
      games.flatMap((gm) =>
        gm.players.map((plr) => [
          `${gm.id}-${plr.id}`,
          plr.questionCounter || 0,
        ]),
      ),
    );
    this.questionTiming = new Map(
      games.flatMap((gm) =>
        gm.players.flatMap((plr) =>
          gm.gameQuestions.map((qs) => [
            `${qs.questionId}-${plr.id}`,
            plr.questionCounter || 0,
          ]),
        ),
      ),
    );
  }

  updateGame(game: BoadMasGame) {
    this.games.set(game.id, game);

    this.inmemoryQuestions.set(game.id, game.questions);

    for (let [_idx, plr] of game.players.entries()) {
      this.setQsCounter(game.id, plr.id, plr.questionCounter || 0);
    }

    for (let [_idx, ques] of game.gameQuestions.entries()) {
      this.setQsTimer(
        ques.questionId,
        ques.userId,
        ques.startTime ? ques.startTime.valueOf() : Date.now(),
      );
    }
  }

  clearGame(game: BoadMasGame) {
    this.games.delete(game.id);

    this.inmemoryQuestions.delete(game.id);

    for (let [_idx, plr] of game.players.entries()) {
      this.delQsCounter(game.id, plr.id);
    }

    for (let [_idx, ques] of game.gameQuestions.entries()) {
      this.delQsTimer(ques.questionId, ques.userId);
    }
  }

  static async getInstance(): Promise<BodmasGameManager> {
    if (!BodmasGameManager.instance) {
      const games = await getGamesFromDb();
      BodmasGameManager.instance = new BodmasGameManager(games);
    }
    return BodmasGameManager.instance;
  }

  create_update_game(data: BoadMasGame) {
    this.games.set(data.id, data);
  }

  // gameId-userId
  getQsCounter(gameId: string, userId: string) {
    const key = `${gameId}:${userId}`;
    return this.questionCounter.get(key);
  }

  // gameId-userId
  setQsCounter(gameId: string, userId: string, counter: number) {
    const key = `${gameId}:${userId}`;
    return this.questionCounter.set(key, counter);
  }

  // gameId-userId
  delQsCounter(gameId: string, userId: string) {
    const key = `${gameId}:${userId}`;
    return this.questionCounter.delete(key);
  }

  // questionId-userId
  setQsTimer(questionId: string, userId: string, time: number) {
    const key = `${questionId}:${userId}`;
    return this.questionTiming.set(key, time);
  }

  // questionId-userId
  getQsTimer(questionId: string, userId: string) {
    const key = `${questionId}:${userId}`;
    return this.questionTiming.get(key);
  }

  // questionId-userId
  delQsTimer(questionId: string, userId: string) {
    const key = `${questionId}:${userId}`;
    return this.questionTiming.delete(key);
  }
}

export const bodmasgameManager = await BodmasGameManager.getInstance();
