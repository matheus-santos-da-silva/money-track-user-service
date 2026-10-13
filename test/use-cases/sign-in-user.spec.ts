import { SignInUserUseCase } from "../../src/application/use-cases";
import { Test, TestingModule } from "@nestjs/testing";
import { InMemoryUserRepository } from "../in-memory-repositories/in-memory-user-repository";
import { UsersRepositoryProtocol } from "../../src/infra/database/repositories/protocols/users-repository-protocol";
import { signInInputMock, createdUserMock } from "../mocks/";
import * as bcrypt from "bcryptjs";

jest.mock("bcryptjs", () => ({
  ...jest.requireActual("bcryptjs"),
  compare: jest.fn(),
}));

describe("SignIn User UseCase", () => {
  let useCase: SignInUserUseCase;
  let usersRepository: UsersRepositoryProtocol;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignInUserUseCase,
        {
          provide: UsersRepositoryProtocol,
          useClass: InMemoryUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<SignInUserUseCase>(SignInUserUseCase);
    usersRepository = module.get<UsersRepositoryProtocol>(
      UsersRepositoryProtocol
    );
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
    expect(usersRepository).toBeDefined();
  });

  it("should be return a token when signIn is successful", async () => {
    await usersRepository.create(createdUserMock);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    const result = useCase.signIn(signInInputMock);
    expect(result).resolves.toHaveProperty("token");
  });

  it("should throw the same generic error when the user does not exist", async () => {
    await expect(useCase.signIn(signInInputMock)).rejects.toThrow(
      "E-mail ou senha incorretos."
    );
  });

  it("should still compare the password when the user does not exist (same response time)", async () => {
    (bcrypt.compare as jest.Mock).mockClear();

    await expect(useCase.signIn(signInInputMock)).rejects.toThrow();

    expect(bcrypt.compare).toHaveBeenCalledTimes(1);
  });

  it("should throw an exception when the password is wrong", async () => {
    await usersRepository.create(createdUserMock);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    await expect(useCase.signIn(signInInputMock)).rejects.toThrow(
      "E-mail ou senha incorretos."
    );
  });
});
