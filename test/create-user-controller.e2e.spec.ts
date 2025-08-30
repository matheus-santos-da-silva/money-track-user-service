import * as request from "supertest";
import { Test } from "@nestjs/testing";
import { AppModule } from "../src/app.module";
import { PrismaService } from "src/infra/database/config/prisma.service";
import { INestApplication } from "@nestjs/common";
import { kafkaProducerMock } from "./mocks/kafka-mock";
import { createUserInputMock } from "./mocks";
import { KafkaProducerService } from "src/infra/kafka/producers/kafka-producer.service";

describe("Create User Controller (e2e) - (POST /users)", () => {
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
    const inputWithoutName = {
      email: "johndoe@email.com",
      password: "test",
    };
    await request(app.getHttpServer())
      .post("/users")
      .send(inputWithoutName)
      .expect(400);
  });
});
