import { Test, TestingModule } from "@nestjs/testing";
import { GetUserUseCase } from "../../src/application/use-cases";
import { UsersRepositoryProtocol } from "../../src/infra/database/repositories/protocols/users-repository-protocol";
import { createdUserMock } from "../mocks/";
import { InMemoryUserRepository } from "../in-memory-repositories/in-memory-user-repository";

describe("Get User UseCase", () => {
  let useCase: GetUserUseCase;
  let usersRepository: UsersRepositoryProtocol;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserUseCase,
        {
          provide: UsersRepositoryProtocol,
          useClass: InMemoryUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetUserUseCase>(GetUserUseCase);
    usersRepository = module.get<UsersRepositoryProtocol>(
      UsersRepositoryProtocol
    );
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
    expect(usersRepository).toBeDefined();
  });

  it("should return a user name", () => {
    usersRepository.create(createdUserMock);
    const result = useCase.findUser("df4a6a95-b6fe-4b6a-8b5e-1e3171fc4b93");
    expect(result).resolves.toHaveProperty("name");
    expect(result).resolves.toMatchObject({ name: createdUserMock.name });
  });

  it("should return isPremium and isTrialActive calculated by the server", async () => {
    const day = 86_400_000;
    const cases: Array<[string, any, Date, boolean, boolean]> = [
      ["FREE with an active trial", "FREE", new Date(Date.now() + day), true, true],
      ["FREE with an expired trial", "FREE", new Date(Date.now() - day), false, false],
      ["PREMIUM with an expired trial", "PREMIUM", new Date(Date.now() - day), true, false],
    ];

    for (const [, plan, trialEndsAt, isPremium, isTrialActive] of cases) {
      const user = { ...createdUserMock, id: `user-${plan}-${+trialEndsAt}`, plan, trialEndsAt };
      await usersRepository.create(user);

      await expect(useCase.findUser(user.id)).resolves.toMatchObject({
        isPremium,
        isTrialActive,
      });
    }
  });

  it("should throw an exception when user id not exists ", () => {
    usersRepository.create(createdUserMock);
    const result = useCase.findUser("invalid-id");
    expect(result).rejects.toThrow("Usuário não encontrado!");
  });
});
