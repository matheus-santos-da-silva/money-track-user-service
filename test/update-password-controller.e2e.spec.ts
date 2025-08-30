import * as request from "supertest";
import { Test } from "@nestjs/testing";
import { AppModule } from "../src/app.module";
import { PrismaService } from "src/infra/database/config/prisma.service";
import { INestApplication } from "@nestjs/common";
import { kafkaProducerMock } from "./mocks/kafka-mock";
import { createUserInputMock } from "./mocks";
import { KafkaProducerService } from "src/infra/kafka/producers/kafka-producer.service";

describe("Update Password Controller (e2e) - (PATCH /users/:id/password)", () => {
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

  it("should return 200 status code when update password", async () => {
    const { body } = await request(app.getHttpServer())
      .post(`/users`)
      .send(createUserInputMock);

    const result = await request(app.getHttpServer())
      .get(`/users`)
      .set("Authorization", `Bearer ${body.token}`);

    await request(app.getHttpServer())
      .patch(`/users/${result.body.id}/password`)
      .set("Authorization", `Bearer ${body.token}`)
      .send({
        currentPassword: createUserInputMock.password,
        newPassword: "new-password",
      })
      .expect(200);
  });

  it("should return a status code 401 when the password if currentPassword is invalid", async () => {
    const { body } = await request(app.getHttpServer())
      .post(`/users`)
      .send(createUserInputMock);

    const result = await request(app.getHttpServer())
      .get(`/users`)
      .set("Authorization", `Bearer ${body.token}`);

    const response = await request(app.getHttpServer())
      .patch(`/users/${result.body.id}/password`)
      .set("Authorization", `Bearer ${body.token}`)
      .send({
        currentPassword: "invalid-password",
        newPassword: "new-password",
      })
      .expect(401);

    expect(response.body.message).toBe("Não foi possível atualizar a senha");
  });

  it("should return a status code 401 when token id is different of path id", async () => {
    const { body } = await request(app.getHttpServer())
      .post(`/users`)
      .send(createUserInputMock);

    const response = await request(app.getHttpServer())
      .patch(`/users/different-id/password`)
      .set("Authorization", `Bearer ${body.token}`)
      .send({
        currentPassword: createUserInputMock.password,
        newPassword: "new-password",
      })
      .expect(401);

    expect(response.body.message).toBe("Você não pode atualizar esse usuário!");
  });
});
