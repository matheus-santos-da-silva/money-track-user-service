import { Module } from "@nestjs/common";
import { CreateUserController, SignInUserController } from ".";
import { UsersUseCasesModule } from "src/application/use-cases/users-use-cases.module";

@Module({
  imports: [UsersUseCasesModule],
  controllers: [CreateUserController, SignInUserController],
})
export class UsersControllersModule {}
