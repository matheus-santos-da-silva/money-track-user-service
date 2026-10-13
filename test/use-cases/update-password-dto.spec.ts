import "reflect-metadata";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { UpdatePasswordDTO } from "src/domain/DTO/update-password-DTO";
import { UpdateUserDTO } from "src/domain/DTO/update-user-DTO";

const errorsOf = async (cls: any, data: Record<string, unknown>) =>
  (await validate(plainToInstance(cls, data))).map((e) => e.property);

describe("UpdatePasswordDTO", () => {
  const valid = { currentPassword: "atual123", newPassword: "nova1234" };

  it("should accept a valid payload", async () => {
    expect(await errorsOf(UpdatePasswordDTO, valid)).toEqual([]);
  });

  it("should reject a new password shorter than 6 characters", async () => {
    expect(await errorsOf(UpdatePasswordDTO, { ...valid, newPassword: "12345" })).toContain(
      "newPassword"
    );
  });

  it("should reject a new password longer than 50 characters", async () => {
    expect(
      await errorsOf(UpdatePasswordDTO, { ...valid, newPassword: "a".repeat(51) })
    ).toContain("newPassword");
  });

  it("should accept the limits (6 and 50 characters)", async () => {
    expect(await errorsOf(UpdatePasswordDTO, { ...valid, newPassword: "a".repeat(6) })).toEqual([]);
    expect(await errorsOf(UpdatePasswordDTO, { ...valid, newPassword: "a".repeat(50) })).toEqual([]);
  });
});

describe("UpdateUserDTO", () => {
  it("should reject a password sent to the profile endpoint (same options as the app ValidationPipe)", async () => {
    const dto = plainToInstance(UpdateUserDTO, { name: "Maria", password: "x" });
    const errors = await validate(dto, { whitelist: true, forbidNonWhitelisted: true });

    expect(errors.map((e) => e.property)).toContain("password");
  });

  it("should still accept name and email", async () => {
    const dto = plainToInstance(UpdateUserDTO, { name: "Maria", email: "maria@email.com" });
    expect(await validate(dto, { whitelist: true, forbidNonWhitelisted: true })).toEqual([]);
  });
});
