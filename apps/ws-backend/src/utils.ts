import type { BodmasQuestion } from "@repo/db/db";

function getRandomNums() {
  let a = Math.floor(Math.random() * 10 * 6);
  let b = Math.floor(Math.random() * 10 * 3);

  return { a, b };
}

export function generateRandomQuesions(): Array<BodmasQuestion> {
  let arr: BodmasQuestion[] = [];

  for (let i = 1; i <= 20; i++) {
    const { a, b } = getRandomNums();

    arr.push({
      id: crypto.randomUUID(),
      answer: a + b,
      createdAt: new Date(),
      operand1: a,
      operand2: b,
      operation: "ADD",
    });
  }
  return arr;
}
