import request from "supertest";
import { Test } from "@nestjs/testing";
import { AppModule } from "../src/app.module";
import { PrismaService } from "src/infra/database/config/prisma.service";
import { INestApplication } from "@nestjs/common";
import { kafkaProducerMock } from "./mocks/kafka-mock";
import { createUserInputMock } from "./mocks";
import { KafkaProducerService } from "src/infra/kafka/producers/kafka-producer.service";

describe("Get User Controller (e2e) - (GET /users)", () => {
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
