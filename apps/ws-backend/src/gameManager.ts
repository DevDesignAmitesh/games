import type { BodmasQuestion } from "@repo/db/db";
import type { BoadMasGame } from "@repo/types/types";
import { getGamesFromDb } from "./utils";
import { userManager } from "./userManager";

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

  // gameid:questionId:userId
  questionAnswer: Map<string, boolean>;

  private constructor(games: BoadMasGame[]) {
    this.games = new Map(games.map((gm) => [gm.id, gm]));
    this.inmemoryQuestions = new Map();
    this.questionCounter = new Map();
    this.questionTiming = new Map();
    this.questionAnswer = new Map();
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

  // gameid:questionId:userId
  getQuestionAnswer(gameId: string, questionId: string, userId: string) {
    const key = `${gameId}-${questionId}-${userId}`;
    return this.questionAnswer.get(key);
  }

  // gameid:questionId:userId
  setQuestionAnswer(gameId: string, userId: string, val: boolean) {
    const key = `${gameId}:${userId}`;
    return this.questionAnswer.set(key, val);
  }
}

export const bodmasgameManager = await BodmasGameManager.getInstance();
