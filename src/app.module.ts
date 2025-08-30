import { Module } from "@nestjs/common";
import { AuthModule } from "./application/auth/auth.module";
import { UsersControllersModule } from "./presentation/controllers/users-controllers.module";

@Module({
  imports: [UsersControllersModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
