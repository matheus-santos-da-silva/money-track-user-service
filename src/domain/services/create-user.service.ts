import { Injectable } from "@nestjs/common";
import { UserAuthDTO } from "../DTO/user-auth-DTO";
import { User } from "../entities/user";
import { encryptPass } from "src/shared/utils/encrypt-password";

@Injectable()
export class CreateUserService {
  async create({ email, password }: UserAuthDTO): Promise<User> {
    const user = new User({
      email,
      password: await encryptPass(password),
      plan: "free",
    });

    return user;
  }
}
