import * as request from "supertest";
import { Test } from "@nestjs/testing";
import { AppModule } from "../src/app.module";
import { PrismaService } from "src/infra/database/config/prisma.service";
import { INestApplication } from "@nestjs/common";
import { kafkaProducerMock } from "./mocks/kafka-mock";
import { KafkaProducerService } from "src/infra/kafka/producers/kafka-producer.service";
import { createUserInputMock, signInInputMock } from "./mocks";

describe("Sign User Controller (e2e) - (POST /users/signIn)", () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(KafkaProducerService)
      .useValue(kafkaProducerMock)
      .compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  beforeEach(async () => {
    await prismaService.user.deleteMany({});
  });

  afterAll(async () => {
    await prismaService.user.deleteMany({});
    await prismaService.$disconnect();
    await app.close();
  });

  it("should return 200 status code when signIn is success", async () => {
    await request(app.getHttpServer()).post("/users").send(createUserInputMock);
    await request(app.getHttpServer())
      .post("/users/signIn")
      .send(signInInputMock)
      .expect(200);
  });

  it("should return 400 status code when the user does not exist", async () => {
    await request(app.getHttpServer())
      .post("/users/signIn")
      .send(signInInputMock)
      .expect(400);
  });

  it("should return 401 status code when the password is wrong", async () => {
    const inputWithWrongPassword = {
      email: "johndoe@email.com",
      password: "wrongPass",
    };
    await request(app.getHttpServer()).post("/users").send(createUserInputMock);
    await request(app.getHttpServer())
      .post("/users/signIn")
      .send(inputWithWrongPassword)
      .expect(401);
  });
});
