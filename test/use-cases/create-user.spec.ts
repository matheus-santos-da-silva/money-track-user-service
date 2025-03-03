import { Test, TestingModule } from "@nestjs/testing";
import { CreateUserUseCase } from "../../src/application/use-cases";
import { CreateUserServiceProtocol } from "../../src/domain/services/protocols";
import { UsersRepositoryProtocol } from "../../src/infra/database/repositories/protocols/users-repository-protocol";
import { createUserInputMock, createdUserMock } from "../mocks/";

describe("Create User UseCase", () => {
  let useCase: CreateUserUseCase;
  let usersRepository: UsersRepositoryProtocol;
  let createUserService: CreateUserServiceProtocol;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserUseCase,
        {
          provide: CreateUserServiceProtocol,
          useFactory: () => ({
            create: jest.fn().mockResolvedValue(createdUserMock),
          }),
        },
        {
          provide: UsersRepositoryProtocol,
          useFactory: () => ({
            create: jest.fn().mockResolvedValue(createdUserMock),
            findByEmail: jest.fn().mockResolvedValue(null),
          }),
        },
      ],
    }).compile();

    useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
    usersRepository = module.get<UsersRepositoryProtocol>(
      UsersRepositoryProtocol
    );
    createUserService = module.get<CreateUserServiceProtocol>(
      CreateUserServiceProtocol
    );
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
    expect(usersRepository).toBeDefined();
    expect(createUserService).toBeDefined();
  });

  it("should create a new User and return a token", () => {
    const result = useCase.create(createUserInputMock);
    expect(result).resolves.toHaveProperty("token");
  });

  it("should throw an exception when the same email already exists", () => {
    jest
      .spyOn(usersRepository, "findByEmail")
      .mockResolvedValue(createdUserMock);
    const result = useCase.create(createUserInputMock);
    expect(result).rejects.toThrow("Usuário já cadastrado. Acesse sua conta!");
  });

  it("should throw an exception when the user is not created", () => {
    jest.spyOn(usersRepository, "create").mockResolvedValue(null);
    const result = useCase.create(createUserInputMock);
    expect(result).rejects.toThrow(
      "Erro na criação do usuário, tente novamente mais tarde!"
    );
  });
});
