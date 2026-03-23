import { hash, compare } from "bcrypt";

export const hashFn = async (password: string) => {
  return await hash(password, 4);
}

export const compareFn = async (password: string, encrypted: string) => {
  return await compare(password, encrypted);
}
