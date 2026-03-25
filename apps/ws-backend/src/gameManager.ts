import type { BodmasQuestion } from "@repo/db/db";
import type { BoadMasGame, User } from "@repo/types/types";

class BodmasGameManager {
  private static instance: BodmasGameManager;

  // gameId, game with all the details (players, answers)
  games: Map<string, BoadMasGame> = new Map();

  // game id with all the questions
  inmemoryQuestions: Map<string, BodmasQuestion[]> = new Map();

  // gameId-userId and question index (for finding that which question to send now)
  questionCounter: Map<string, number> = new Map();

  // questionId-userId and answers at (for calculating the response from the user of a particular ques.)
  questionTiming: Map<string, number> = new Map();

  private constructor() {}

  static getInstance(): BodmasGameManager {
    if (!BodmasGameManager.instance) {
      BodmasGameManager.instance = new BodmasGameManager();
    }
    return BodmasGameManager.instance;
  }

  create_update_game(data: BoadMasGame) {
    this.games.set(data.id, data);
  }

  // gameId-userId
  getQsCounter(gameId: string, userId: string) {
    const key = `${gameId}:${userId}`
    return this.questionCounter.get(key);
  }

  // gameId-userId
  setQsCounter(gameId: string, userId: string, counter: number) {
    const key = `${gameId}:${userId}`
    return this.questionCounter.set(key, counter);
  }

  // questionId-userId
  setQsTimer(questionId: string, userId: string, time: number) {
    const key = `${questionId}:${userId}`
    return this.questionCounter.set(key, time);
  }
}

export const bodmasgameManager = BodmasGameManager.getInstance();
