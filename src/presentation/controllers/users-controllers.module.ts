import { Module } from "@nestjs/common";
import {
  CreateUserController,
  GetUserController,
  SignInUserController,
} from ".";
import { UsersUseCasesModule } from "src/application/use-cases/users-use-cases.module";

@Module({
  imports: [UsersUseCasesModule],
  controllers: [CreateUserController, SignInUserController, GetUserController],
})
export class UsersControllersModule {}
