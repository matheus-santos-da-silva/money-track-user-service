import { Module } from "@nestjs/common";
import { CreateUserServiceProtocol } from "./protocols";
import { CreateUserService } from "./create-user.service";

@Module({
  imports: [],
  providers: [
    {
      provide: CreateUserServiceProtocol,
      useClass: CreateUserService,
    },
  ],
  exports: [CreateUserServiceProtocol],
})
export class UsersServicesModule {}
