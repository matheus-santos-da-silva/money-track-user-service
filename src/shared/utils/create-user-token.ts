import { sign } from "jsonwebtoken";

interface payload {
  id: string;
}

export const createUserToken = async (payload: payload) => {
  const token = sign(payload, `${process.env.JWT_SECRET}`);
  return token;
};
