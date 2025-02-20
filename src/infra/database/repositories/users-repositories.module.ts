import { Module } from "@nestjs/common";
import { UsersRepositoryProtocol } from "./protocols/users-repository-protocol";
import { UsersRepository } from "./users-repository";
import { PrismaModule } from "../config/prisma.module";

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: UsersRepositoryProtocol,
      useClass: UsersRepository,
    },
  ],
  exports: [UsersRepositoryProtocol],
})
export class UsersRepositoriesModule {}
