import { genSaltSync, hash } from "bcryptjs";

export const encryptPass = async (password: string) => {
  const salt = genSaltSync(12);
  const passwordHash = await hash(password, salt);

  return passwordHash;
};
