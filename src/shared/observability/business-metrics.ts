import { metrics } from "@opentelemetry/api";

const meter = metrics.getMeter("users-service");

export const signUpsTotal = meter.createCounter("money_track.users.signups", {
  description: "Cadastros concluídos",
});

export const signInsTotal = meter.createCounter("money_track.users.sign_ins", {
  description: "Tentativas de login, por resultado",
});

// Séries que só nasceriam no primeiro incremento: começar em 0 deixa o rate() correto desde o início.
signInsTotal.add(0, { result: "success" });
signInsTotal.add(0, { result: "invalid_credentials" });
