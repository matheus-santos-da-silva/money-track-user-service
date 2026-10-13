import { createdUserMock } from "../mocks/";
import { UpdateUserUseCase } from "../../src/application/use-cases";
import { Test, TestingModule } from "@nestjs/testing";
import { InMemoryUserRepository } from "../in-memory-repositories/in-memory-user-repository";
import { UsersRepositoryProtocol } from "../../src/infra/database/repositories/protocols/users-repository-protocol";

describe("Update User UseCase", () => {
  let useCase: UpdateUserUseCase;
  let usersRepository: UsersRepositoryProtocol;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserUseCase,
        {
          provide: UsersRepositoryProtocol,
          useClass: InMemoryUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateUserUseCase>(UpdateUserUseCase);
    usersRepository = module.get<UsersRepositoryProtocol>(
      UsersRepositoryProtocol
    );
  });

  it("should be defined", () => {
    expect(useCase).toBeDefined();
    expect(usersRepository).toBeDefined();
  });

  it("should update a user", async () => {
    await usersRepository.create(createdUserMock);
    await useCase.update(createdUserMock.id, { name: "updated-name" });

    const { name } = await usersRepository.findById(createdUserMock.id);
    expect(name).toEqual("updated-name");
  });

  it("should throw a conflict when the email belongs to another user", async () => {
    await usersRepository.create(createdUserMock);
    await usersRepository.create({
      ...createdUserMock,
      id: "another-user-id",
      email: "taken@email.com",
    });

    await expect(
      useCase.update(createdUserMock.id, { email: "taken@email.com" })
    ).rejects.toThrow("E-mail já está em uso.");
  });

  it("should allow keeping the user's own email", async () => {
    await usersRepository.create(createdUserMock);

    await expect(
      useCase.update(createdUserMock.id, { email: createdUserMock.email })
    ).resolves.toBeUndefined();
  });

  it("should throw an exception when the user not exists", () => {
    const result = useCase.update("invalid-id", { name: "updated-name" });
    expect(result).rejects.toThrow("Usuário não existe!");
  });
});
