import { sign } from "jsonwebtoken";

interface payload {
  id: string;
}

export const createUserToken = async (payload: payload) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  const token = sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  return token;
};
