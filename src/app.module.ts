import { Module } from "@nestjs/common";
import { UsersControllersModule } from "./presentation/controllers/users-controllers.module";

@Module({
  imports: [UsersControllersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
