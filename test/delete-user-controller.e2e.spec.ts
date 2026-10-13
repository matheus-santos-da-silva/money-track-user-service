import request from "supertest";
import { Test } from "@nestjs/testing";
import { AppModule } from "../src/app.module";
import { PrismaService } from "src/infra/database/config/prisma.service";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { kafkaProducerMock } from "./mocks/kafka-mock";
import { createUserInputMock } from "./mocks";
import { KafkaProducerService } from "src/infra/kafka/producers/kafka-producer.service";

describe("Delete User Controller (e2e) - (DELETE /users/:id)", () => {
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
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
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

  const createUser = async () => {
    const { body } = await request(app.getHttpServer())
      .post(`/users`)
      .send(createUserInputMock);

    const { body: user } = await request(app.getHttpServer())
      .get(`/users`)
      .set("Authorization", `Bearer ${body.token}`);

    return { token: body.token as string, id: user.id as string };
  };

  it("should return 204 and remove the user when the password is correct", async () => {
    const { token, id } = await createUser();

    await request(app.getHttpServer())
      .delete(`/users/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ password: createUserInputMock.password })
      .expect(204);

    expect(await prismaService.user.findUnique({ where: { id } })).toBeNull();
    expect(kafkaProducerMock.send).toHaveBeenCalled();
  });

  it("should return 403 and keep the user when the password is wrong", async () => {
    const { token, id } = await createUser();

    await request(app.getHttpServer())
      .delete(`/users/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ password: "wrong-password" })
      .expect(403);

    expect(
      await prismaService.user.findUnique({ where: { id } }),
    ).not.toBeNull();
  });

  it("should return 403 when trying to delete another user", async () => {
    const { token } = await createUser();

    await request(app.getHttpServer())
      .delete(`/users/another-user-id`)
      .set("Authorization", `Bearer ${token}`)
      .send({ password: createUserInputMock.password })
      .expect(403);
  });

  it("should return 401 without a token", async () => {
    await request(app.getHttpServer())
      .delete(`/users/some-id`)
      .send({ password: createUserInputMock.password })
      .expect(401);
  });
});
