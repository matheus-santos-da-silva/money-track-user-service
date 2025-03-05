import * as request from "supertest";
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { AppModule } from "../src/app.module";
import { PrismaService } from "src/infra/database/config/prisma.service";
import { createUserInputMock } from "./mocks";

describe("Create User Controller (e2e) - (POST /users)", () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterEach(async () => {
    await prismaService.user.deleteMany({});
  });

  it("should return 201 status code when create a user", async () => {
    await request(app.getHttpServer())
      .post("/users")
      .send(createUserInputMock)
      .expect(201);
  });

  it("should return a status code 409 when the same email already exists", async () => {
    await request(app.getHttpServer()).post("/users").send(createUserInputMock);
    await request(app.getHttpServer())
      .post("/users")
      .send(createUserInputMock)
      .expect(409);
  });

  it("should return a status code 400 when the user is not created", async () => {
    const inputWithoutPassword = {
      email: "johndoe@email.com",
      name: "John Doe",
    };
    await request(app.getHttpServer())
      .post("/users")
      .send(inputWithoutPassword)
      .expect(400);
  });
});
