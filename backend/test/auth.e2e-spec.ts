import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { LoginDto, RegisterDto } from '../src/app/auth/dto';
import { PrismaService } from '../src/app/prisma/prisma.service';

const authDto: RegisterDto = {
  email: 'sorena@gmail.com',
  username: 'sorena',
  password: 'strongpassword',
};

enum ERROR_MESSAGES {
  credentials_taken = 'Credentials taken',
  user_not_found = 'User not found',
  credentials_incorrect = 'Credentials incorrect',
  bad_request = 'Bad Request',
}

describe('/auth', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    console.log(app);

    // Global pipes
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );

    await app.init();
    await app.listen(3333);

    // Prisma Service
    prisma = app.get(PrismaService);

    // Clean database
    await prisma.cleanDb();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('register', () => {
    it('/auth/register POST (201)', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/auth/register')
        .send(authDto)
        .expect(HttpStatus.CREATED);

      expect(body.success).toEqual(true);
    });

    it('/auth/register POST (404: credentials not provided)', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/auth/register')
        .send({})
        .expect(HttpStatus.BAD_REQUEST);

      expect(body.error).toEqual(ERROR_MESSAGES.bad_request);
    });

    it('/auth/register POST (403: credentials taken)', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/auth/register')
        .send(authDto)
        .expect(HttpStatus.FORBIDDEN);

      expect(body).toEqual({
        success: false,
        message: ERROR_MESSAGES.credentials_taken,
      });
    });
  });

  describe('login', () => {
    it('/auth/login POST (200)', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ ...authDto } as LoginDto)
        .expect(HttpStatus.OK);

      expect(body.success).toEqual(true);
    });

    it('/auth/login POST (404: credentials not provided)', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/auth/login')
        .send({})
        .expect(HttpStatus.BAD_REQUEST);

      expect(body.error).toEqual(ERROR_MESSAGES.bad_request);
    });

    it('/auth/login POST (403: credentials incorrect)', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: authDto.email,
          password: 'differentpassword',
        } as LoginDto)
        .expect(HttpStatus.UNAUTHORIZED);

      expect(body).toEqual({
        success: false,
        message: ERROR_MESSAGES.credentials_incorrect,
      });
    });
  });
});
