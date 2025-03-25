import * as request from "supertest";
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { AppModule } from "../src/app.module";
import { PrismaService } from "src/infra/database/config/prisma.service";
import { createUserInputMock } from "./mocks";

describe("Get User Controller (e2e) - (GET /users)", () => {
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

  it("should return 200 status code when it is all ok", async () => {
    const { body }: { body: { token: string } } = await request(
      app.getHttpServer()
    )
      .post("/users")
      .send(createUserInputMock);

    await request(app.getHttpServer())
      .get("/users")
      .set("Authorization", `Bearer ${body.token}`)
      .expect(200);
  });

  it("should return 401 status code when token is not provided", async () => {
    await request(app.getHttpServer()).get("/users").expect(401);
  });

  it("should return 401 status code when the token is invalid", async () => {
    await request(app.getHttpServer())
      .get("/users")
      .set("Authorization", `Bearer invalid-token`)
      .expect(401);
  });
});
