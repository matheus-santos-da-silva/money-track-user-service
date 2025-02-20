import { Module } from "@nestjs/common";
import { CreateUserProtocol } from "src/domain/use-cases-protocol/create-user";
import { CreateUserUseCase } from "./create-user-use-case";
import { UsersRepositoriesModule } from "src/infra/database/repositories/users-repositories.module";
import { UsersServicesModule } from "src/domain/services/users-services.module";

@Module({
  imports: [UsersRepositoriesModule, UsersServicesModule],
  providers: [
    {
      provide: CreateUserProtocol,
      useClass: CreateUserUseCase,
    },
  ],
  exports: [CreateUserProtocol],
})
export class UsersUseCasesModule {}
