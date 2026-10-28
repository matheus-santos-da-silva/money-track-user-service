import { Counter } from "prom-client";
import { registry } from "./metrics";

export const signUpsTotal = new Counter({
  name: "users_signups_total",
  help: "Cadastros concluídos",
  registers: [registry],
});

export const signInsTotal = new Counter({
  name: "users_sign_ins_total",
  help: "Tentativas de login, por resultado",
  labelNames: ["result"] as const,
  registers: [registry],
});

export const kafkaEventsPublishedTotal = new Counter({
  name: "kafka_events_published_total",
  help: "Eventos publicados no Kafka, por tópico e resultado",
  labelNames: ["topic", "result"] as const,
  registers: [registry],
});

// Séries que só nasceriam no primeiro incremento: começar em 0 deixa o rate() correto desde o início.
signInsTotal.inc({ result: "success" }, 0);
signInsTotal.inc({ result: "invalid_credentials" }, 0);
