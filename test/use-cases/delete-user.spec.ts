import { encryptPass } from "src/shared/utils/encrypt-password";
import { createdUserMock } from "../mocks/";
import { Test, TestingModule } from "@nestjs/testing";
import { DeleteUserUseCase } from "../../src/application/use-cases";
import { KafkaProducerService } from "src/infra/kafka/producers/kafka-producer.service";
import { InMemoryUserRepository } from "../in-memory-repositories/in-memory-user-repository";
import { UsersRepositoryProtocol } from "../../src/infra/database/repositories/protocols/users-repository-protocol";

describe("Delete User UseCase", () => {
  let useCase: DeleteUserUseCase;
  let usersRepository: UsersRepositoryProtocol;
  let kafkaSend: jest.Mock;

  beforeEach(async () => {
    kafkaSend = jest.fn().mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteUserUseCase,
        {
          provide: UsersRepositoryProtocol,
          useClass: InMemoryUserRepository,
        },
        {
          provide: KafkaProducerService,
          useValue: { send: kafkaSend },
        },
      ],
    }).compile();

    useCase = module.get<DeleteUserUseCase>(DeleteUserUseCase);
    usersRepository = module.get<UsersRepositoryProtocol>(
      UsersRepositoryProtocol,
    );

    await usersRepository.create({
      ...createdUserMock,
      password: await encryptPass("correct-password"),
    });
  });

  it("should delete the user and publish the user-deleted event", async () => {
    await useCase.delete(createdUserMock.id, { password: "correct-password" });

    expect(await usersRepository.findById(createdUserMock.id)).toBeUndefined();
    expect(kafkaSend).toHaveBeenCalledWith({
      topic: "user-deleted",
      key: "user-deleted",
      value: { id: createdUserMock.id },
    });
  });

  it("should not delete the user with a wrong password", async () => {
    await expect(
      useCase.delete(createdUserMock.id, { password: "wrong-password" }),
    ).rejects.toThrow("Senha incorreta. Tente novamente!");

    expect(await usersRepository.findById(createdUserMock.id)).toBeDefined();
    expect(kafkaSend).not.toHaveBeenCalled();
  });

  it("should throw when the user does not exist", async () => {
    await expect(
      useCase.delete("unknown-id", { password: "correct-password" }),
    ).rejects.toThrow("Usuário não existe!");
  });

  it("should still succeed when publishing the event fails", async () => {
    jest.spyOn(console, "error").mockImplementation(() => undefined);
    kafkaSend.mockRejectedValueOnce(new Error("kafka down"));

    await expect(
      useCase.delete(createdUserMock.id, { password: "correct-password" }),
    ).resolves.toBeUndefined();

    expect(await usersRepository.findById(createdUserMock.id)).toBeUndefined();
  });
});
