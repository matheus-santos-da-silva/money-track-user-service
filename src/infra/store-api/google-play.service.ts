import { Injectable, InternalServerErrorException } from "@nestjs/common";

interface GooglePlaySubscriptionResult {
  valid: boolean;
  expiresAt: Date;
}

@Injectable()
export class GooglePlayService {
  async verifySubscription(
    purchaseToken: string,
    productId: string,
  ): Promise<GooglePlaySubscriptionResult> {
    const packageName = process.env.GOOGLE_PACKAGE_NAME;
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

    if (!packageName || !serviceAccountKey) {
      throw new InternalServerErrorException(
        "Configuração do Google Play ausente",
      );
    }

    try {
      const credentials = JSON.parse(serviceAccountKey);
      const accessToken = await this.getAccessToken(credentials);

      const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/purchases/subscriptionsv2/tokens/${purchaseToken}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) return { valid: false, expiresAt: new Date() };

      const data = (await response.json()) as {
        subscriptionState?: string;
        lineItems?: Array<{ expiryTime?: string }>;
      };

      const isActive =
        data.subscriptionState === "SUBSCRIPTION_STATE_ACTIVE" ||
        data.subscriptionState === "SUBSCRIPTION_STATE_IN_GRACE_PERIOD";

      const expiryTimeStr = data.lineItems?.[0]?.expiryTime;
      const expiresAt = expiryTimeStr ? new Date(expiryTimeStr) : new Date();

      return { valid: isActive, expiresAt };
    } catch {
      throw new InternalServerErrorException(
        "Erro ao verificar assinatura com o Google Play",
      );
    }
  }

  private async getAccessToken(credentials: {
    client_email: string;
    private_key: string;
  }): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const header = { alg: "RS256", typ: "JWT" };
    const payload = {
      iss: credentials.client_email,
      scope: "https://www.googleapis.com/auth/androidpublisher",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    };

    const encode = (obj: object) =>
      Buffer.from(JSON.stringify(obj))
        .toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");

    const signingInput = `${encode(header)}.${encode(payload)}`;

    const { createSign } = await import("crypto");
    const sign = createSign("RSA-SHA256");
    sign.update(signingInput);
    const signature = sign
      .sign(credentials.private_key, "base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    const jwt = `${signingInput}.${signature}`;

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    });

    const tokenData = (await tokenResponse.json()) as {
      access_token?: string;
    };

    if (!tokenData.access_token) {
      throw new InternalServerErrorException(
        "Falha ao obter token de acesso do Google",
      );
    }

    return tokenData.access_token;
  }
}
