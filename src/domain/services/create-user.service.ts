import { Plan } from "@prisma/client";
import { User } from "../entities/user";
import { Injectable } from "@nestjs/common";
import { encryptPass } from "src/shared/utils/encrypt-password";
import { CreateUserDTO } from "../DTO/create-user-DTO";

@Injectable()
export class CreateUserService {
  async create({ email, name, password }: CreateUserDTO): Promise<User> {
    const trialStartedAt = new Date();

    const trialEndsAt = new Date(trialStartedAt);
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);

    const user = new User({
      email,
      name,
      password: await encryptPass(password),
      plan: Plan.FREE,
      trialStartedAt,
      trialEndsAt,
    });

    return user;
  }
}
