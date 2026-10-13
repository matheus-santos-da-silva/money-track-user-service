import { FindUserResponseDTO } from "./find-user-response-DTO";

// O que o app recebe em GET /users: os dados do usuário e o acesso já calculado pelo
// servidor (o app não deve recalcular a regra de plano/trial).
export interface GetUserResponseDTO extends FindUserResponseDTO {
  isPremium: boolean;
  isTrialActive: boolean;
}
