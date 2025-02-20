import { Module } from "@nestjs/common";
import { CreateUserController } from ".";
import { UsersUseCasesModule } from "src/application/use-cases/users-use-cases.module";

@Module({
  imports: [UsersUseCasesModule],
  controllers: [CreateUserController],
})
export class UsersControllersModule {}
