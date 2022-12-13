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

describe('/auth', () => {
  let app: INestApplication;
  let prisma: PrismaService;

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
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({})
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('/auth/register POST (403: credentials taken)', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(authDto)
        .expect(HttpStatus.FORBIDDEN);
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
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({})
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('/auth/login POST (403: credentials incorrect)', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: authDto.email,
          password: 'differentpassword',
        } as LoginDto)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
