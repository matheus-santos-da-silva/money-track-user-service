import { encryptPass } from "src/shared/utils/encrypt-password";
import { createdUserMock } from "../mocks/";
import { Test, TestingModule } from "@nestjs/testing";
import { UpdatePasswordUseCase } from "../../src/application/use-cases";
import { InMemoryUserRepository } from "../in-memory-repositories/in-memory-user-repository";
import { UsersRepositoryProtocol } from "../../src/infra/database/repositories/protocols/users-repository-protocol";

describe("Update Password UseCase", () => {
  let useCase: UpdatePasswordUseCase;
  let usersRepository: UsersRepositoryProtocol;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdatePasswordUseCase,
        {
          provide: UsersRepositoryProtocol,
          useClass: InMemoryUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdatePasswordUseCase>(UpdatePasswordUseCase);
    usersRepository = module.get<UsersRepositoryProtocol>(
      UsersRepositoryProtocol
    );
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
    expect(usersRepository).toBeDefined();
  });

  it("should update password", async () => {
    const passwordHash = await encryptPass(createdUserMock.password);
    await usersRepository.create({
      ...createdUserMock,
      password: passwordHash,
    });

    const result = useCase.update(createdUserMock.id, {
      currentPassword: createdUserMock.password,
      newPassword: "test-password",
    });

    expect(result).resolves;
  });

  it("should throw exception when current password is incorrect", async () => {
    const passwordHash = await encryptPass(createdUserMock.password);

    await usersRepository.create({
      ...createdUserMock,
      password: passwordHash,
    });

    const result = useCase.update(createdUserMock.id, {
      currentPassword: "incorrect-password",
      newPassword: "new-password",
    });

    await expect(result).rejects.toThrow("Não foi possível atualizar a senha");
  });

  it("should throw an exception when the user not exists", () => {
    const result = useCase.update("invalid-id", {
      currentPassword: createdUserMock.password,
      newPassword: "test-password",
    });

    expect(result).rejects.toThrow("Usuário não existe!");
  });
});
