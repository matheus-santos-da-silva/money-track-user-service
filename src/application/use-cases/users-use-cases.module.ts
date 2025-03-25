import { Module } from "@nestjs/common";
import { UsersRepositoriesModule } from "src/infra/database/repositories/users-repositories.module";
import { UsersServicesModule } from "src/domain/services/users-services.module";
import { SignInUserUseCase, CreateUserUseCase, GetUserUseCase } from "./";
import {
  SignInUserProtocol,
  CreateUserProtocol,
  GetUserProtocol,
} from "src/domain/use-cases-protocol/";

@Module({
  imports: [UsersRepositoriesModule, UsersServicesModule],
  providers: [
    {
      provide: CreateUserProtocol,
      useClass: CreateUserUseCase,
    },
    {
      provide: SignInUserProtocol,
      useClass: SignInUserUseCase,
    },
    {
      provide: GetUserProtocol,
      useClass: GetUserUseCase,
    },
  ],
  exports: [CreateUserProtocol, SignInUserProtocol, GetUserProtocol],
})
export class UsersUseCasesModule {}
