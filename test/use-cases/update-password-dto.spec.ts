import "reflect-metadata";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { UpdatePasswordDTO } from "src/domain/DTO/update-password-DTO";
import { UpdateUserDTO } from "src/domain/DTO/update-user-DTO";
import { CreateUserDTO } from "src/domain/DTO/create-user-DTO";

const errorsOf = async (cls: any, data: Record<string, unknown>) =>
  (await validate(plainToInstance(cls, data))).map((e) => e.property);

describe("UpdatePasswordDTO", () => {
  const valid = { currentPassword: "atual123", newPassword: "nova1234" };

  it("should accept a valid payload", async () => {
    expect(await errorsOf(UpdatePasswordDTO, valid)).toEqual([]);
  });

  it("should reject a new password shorter than 8 characters", async () => {
    expect(await errorsOf(UpdatePasswordDTO, { ...valid, newPassword: "1234567" })).toContain(
      "newPassword"
    );
  });

  it("should reject a new password longer than 64 characters", async () => {
    expect(
      await errorsOf(UpdatePasswordDTO, { ...valid, newPassword: "a".repeat(65) })
    ).toContain("newPassword");
  });

  it("should accept the limits (8 and 64 characters)", async () => {
    expect(await errorsOf(UpdatePasswordDTO, { ...valid, newPassword: "a".repeat(8) })).toEqual([]);
    expect(await errorsOf(UpdatePasswordDTO, { ...valid, newPassword: "a".repeat(64) })).toEqual([]);
  });
});

describe("CreateUserDTO", () => {
  const valid = { name: "Ana", email: "ana@email.com", password: "12345678" };

  it("should accept a valid payload", async () => {
    expect(await errorsOf(CreateUserDTO, valid)).toEqual([]);
  });

  it("should apply the password limits (8 to 64)", async () => {
    expect(await errorsOf(CreateUserDTO, { ...valid, password: "1234567" })).toContain("password");
    expect(await errorsOf(CreateUserDTO, { ...valid, password: "a".repeat(65) })).toContain("password");
    expect(await errorsOf(CreateUserDTO, { ...valid, password: "a".repeat(64) })).toEqual([]);
  });

  it("should apply the name limits (2 to 40)", async () => {
    expect(await errorsOf(CreateUserDTO, { ...valid, name: "A" })).toContain("name");
    expect(await errorsOf(CreateUserDTO, { ...valid, name: "a".repeat(41) })).toContain("name");
    expect(await errorsOf(CreateUserDTO, { ...valid, name: "Al" })).toEqual([]);
    expect(await errorsOf(CreateUserDTO, { ...valid, name: "a".repeat(40) })).toEqual([]);
  });
});

describe("UpdateUserDTO", () => {
  it("should reject a password sent to the profile endpoint (same options as the app ValidationPipe)", async () => {
    const dto = plainToInstance(UpdateUserDTO, { name: "Maria", password: "x" });
    const errors = await validate(dto, { whitelist: true, forbidNonWhitelisted: true });

    expect(errors.map((e) => e.property)).toContain("password");
  });

  it("should apply the name limits (2 to 40)", async () => {
    expect(await errorsOf(UpdateUserDTO, { name: "a".repeat(41) })).toContain("name");
    expect(await errorsOf(UpdateUserDTO, { name: "a".repeat(40) })).toEqual([]);
  });

  it("should still accept name and email", async () => {
    const dto = plainToInstance(UpdateUserDTO, { name: "Maria", email: "maria@email.com" });
    expect(await validate(dto, { whitelist: true, forbidNonWhitelisted: true })).toEqual([]);
  });
});
