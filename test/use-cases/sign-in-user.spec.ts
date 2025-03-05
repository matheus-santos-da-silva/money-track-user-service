import { Test, TestingModule } from "@nestjs/testing";
import { SignInUserUseCase } from "../../src/application/use-cases";
import { UsersRepositoryProtocol } from "../../src/infra/database/repositories/protocols/users-repository-protocol";
import { signInInputMock, createdUserMock } from "../mocks/";
import { InMemoryUserRepository } from "../in-memory-repositories/in-memory-user-repository";
import * as bcrypt from "bcrypt";

jest.spyOn(bcrypt, "compare");

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

  it("should throw an exception when the user does not exist", () => {
    const result = useCase.signIn(signInInputMock);
    expect(result).rejects.toThrow("Email não cadastrado. Crie uma conta!");
  });

  it("should throw an exception when the password is wrong", async () => {
    await usersRepository.create(createdUserMock);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    const result = useCase.signIn(signInInputMock);
    expect(result).rejects.toThrow("Senha incorreta. Tente novamente!");
  });
});
