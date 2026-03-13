export interface PubSubBody {
  message: {
    data: string;
    messageId?: string;
    publishTime?: string;
  };
  subscription?: string;
}

export abstract class HandleGooglePlayWebhookProtocol {
  abstract handle(body: PubSubBody): Promise<void>;
}
