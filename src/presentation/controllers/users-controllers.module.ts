import { Module } from "@nestjs/common";
import { AuthModule } from "src/application/auth/auth.module";
import { UsersUseCasesModule } from "src/application/use-cases/users-use-cases.module";
import {
  CreateUserController,
  GetUserController,
  SignInUserController,
  UpdateUserController,
  UpdatePasswordController,
  ValidatePurchaseController,
  GooglePlayWebhookController,
} from ".";

@Module({
  imports: [UsersUseCasesModule, AuthModule],
  controllers: [
    CreateUserController,
    SignInUserController,
    GetUserController,
    UpdateUserController,
    UpdatePasswordController,
    ValidatePurchaseController,
    GooglePlayWebhookController,
  ],
})
export class UsersControllersModule {}
