import request from "supertest";
import { Test } from "@nestjs/testing";
import { AppModule } from "../src/app.module";
import { PrismaService } from "src/infra/database/config/prisma.service";
import { INestApplication } from "@nestjs/common";
import { kafkaProducerMock } from "./mocks/kafka-mock";
import { createUserInputMock } from "./mocks";
import { KafkaProducerService } from "src/infra/kafka/producers/kafka-producer.service";

describe("Update User Controller (e2e) - (PATCH /users/:id)", () => {
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

  it("should return 200 status code when update a user", async () => {
    const { body } = await request(app.getHttpServer())
      .post(`/users`)
      .send(createUserInputMock);

    const result = await request(app.getHttpServer())
      .get(`/users`)
      .set("Authorization", `Bearer ${body.token}`);

    await request(app.getHttpServer())
      .patch(`/users/${result.body.id}`)
      .set("Authorization", `Bearer ${body.token}`)
      .send({ name: "updated-name" })
      .expect(200);
  });

  it("should return a status code 403 when token id is different of path id", async () => {
    const { body } = await request(app.getHttpServer())
      .post(`/users`)
      .send(createUserInputMock);

    await request(app.getHttpServer())
      .patch(`/users/different-id`)
      .set("Authorization", `Bearer ${body.token}`)
      .send({ name: "updated-name" })
      .expect(403);
  });
});
