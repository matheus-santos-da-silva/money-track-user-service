import { User } from "src/domain/entities/user";

export const createdUserMock: User = {
  id: "df4a6a95-b6fe-4b6a-8b5e-1e3171fc4b93",
  name: "John Doe",
  email: "johndoe@email.com",
  password: "$2y$12$ZAj8z3oAahvU7aQNKNqrh.Sf0jIKAr922ZhmHLr34r7UbBsaybkbK",
  plan: "FREE",
  created_at: new Date(),
  trialStartedAt: new Date(),
  trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
};
