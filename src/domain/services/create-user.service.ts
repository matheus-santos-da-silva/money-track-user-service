import { Injectable } from "@nestjs/common";
import { CreateUserDTO } from "../DTO/create-user-DTO";
import { User } from "../entities/user";
import { encryptPass } from "src/shared/utils/encrypt-password";

@Injectable()
export class CreateUserService {
  async create({ email, name, password }: CreateUserDTO): Promise<User> {
    const user = new User({
      email,
      name,
      password: await encryptPass(password),
      plan: "free",
    });

    return user;
  }
}
