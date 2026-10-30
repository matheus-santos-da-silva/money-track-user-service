import { SignInUserUseCase } from "../../src/application/use-cases";
import { Test, TestingModule } from "@nestjs/testing";
import { InMemoryUserRepository } from "../in-memory-repositories/in-memory-user-repository";
import { UsersRepositoryProtocol } from "../../src/infra/database/repositories/protocols/users-repository-protocol";
import { signInInputMock, createdUserMock } from "../mocks/";
import * as bcrypt from "bcryptjs";
import { setupInMemoryTracing } from "../helpers/in-memory-tracing";
import { counterValue } from "../helpers/in-memory-metrics";

const { exporter } = setupInMemoryTracing();

const count = async (result: string) =>
  (await counterValue("money_track.users.sign_ins", { result })) ?? 0;

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

  it("should time the password check in its own span", async () => {
    exporter.reset();
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await useCase.signIn(signInInputMock).catch(() => undefined);

    expect(exporter.getFinishedSpans().map((span) => span.name)).toContain(
      "password.compare"
    );
  });

  it("should start both sign-in series at zero", async () => {
    const series = (result: string) =>
      counterValue("money_track.users.sign_ins", { result });

    expect(await series("success")).toBeDefined();
    expect(await series("invalid_credentials")).toBeDefined();
  });

  it("should count sign-ins by result", async () => {
    const before = {
      failed: await count("invalid_credentials"),
      succeeded: await count("success"),
    };
    await usersRepository.create(createdUserMock);

    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    await useCase.signIn(signInInputMock).catch(() => undefined);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    await useCase.signIn(signInInputMock);

    expect(await count("invalid_credentials")).toBe(before.failed + 1);
    expect(await count("success")).toBe(before.succeeded + 1);
  });
});
