import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { RegisterDto } from '../src/app/auth/dto';
import { PrismaService } from '../src/app/prisma/prisma.service';

const authDto: RegisterDto = {
  email: 'sorenapaydar@gmail.com',
  username: 'sorena-paydar',
  password: 'strongpassword',
};

describe('/user', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let access_token: string;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    // Global pipes
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );

    await app.init();

    // Prisma Service
    prisma = app.get(PrismaService);

    // Clean database
    await prisma.cleanDb();

    // create user and save token (/auth/register)
    const {
      body: { data, success },
    } = await request(app.getHttpServer())
      .post('/auth/register')
      .send(authDto)
      .expect(HttpStatus.CREATED);

    expect(success).toEqual(true);

    access_token = data['access_token'];
  });

  afterAll(async () => {
    await app.close();
  });

  it('/user/{username} GET (200)', async () => {
    const {
      body: { success, data },
    } = await request(app.getHttpServer())
      .get(`/user/${authDto.username}`)
      .set({ Authorization: 'Bearer ' + access_token })
      .expect(HttpStatus.OK);

    expect(success).toEqual(true);
    expect(data.email).toEqual(authDto.email);
    expect(data.username).toEqual(authDto.username);
  });

  it('/user/{username} GET (401: token not provided)', async () => {
    await request(app.getHttpServer())
      .get(`/user/${authDto.username}`)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('/user/{username} GET (401: invalid token)', async () => {
    await request(app.getHttpServer())
      .get(`/user/${authDto.username}`)
      .set({ Authorization: 'Bearer ' + 'aksdjaljdklsd' })
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('/user/{username} GET (404: user not found)', async () => {
    await request(app.getHttpServer())
      .get(`/user/wrong-username`)
      .set({ Authorization: 'Bearer ' + access_token })
      .expect(HttpStatus.NOT_FOUND);
  });
});
