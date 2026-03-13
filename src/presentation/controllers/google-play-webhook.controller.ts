import {
  HandleGooglePlayWebhookProtocol,
  PubSubBody,
} from "src/domain/use-cases-protocol/handle-google-play-webhook";
import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Post,
  UnauthorizedException,
} from "@nestjs/common";

@Controller("subscriptions")
export class GooglePlayWebhookController {
  constructor(
    private readonly handleWebhookUseCase: HandleGooglePlayWebhookProtocol,
  ) {}

  @Post("webhook/google-play")
  @HttpCode(200)
  async execute(
    @Headers("authorization") authorization: string,
    @Body() body: PubSubBody,
  ) {
    try {
      const expectedToken = process.env.GOOGLE_PLAY_PUBSUB_TOKEN;
      const receivedToken = authorization?.replace("Bearer ", "");

      if (!expectedToken || receivedToken !== expectedToken) {
        throw new UnauthorizedException("Token inválido");
      }

      await this.handleWebhookUseCase.handle(body);
    } catch (error) {
      throw error;
    }
  }
}
