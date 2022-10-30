import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/app/prisma/prisma.service';
import { LoginDto, RegisterDto } from '../src/app/auth/dto';

describe('App (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let authDto: RegisterDto;
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
    await app.listen(3333);

    // Prisma Service
    prisma = app.get(PrismaService);

    // Clean database
    await prisma.cleanDb();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    authDto = {
      email: 'sorena@gmail.com',
      username: 'sorena',
      password: 'strongpassword',
    };

    describe('Register', () => {
      it('create new user', (done) => {
        request(app.getHttpServer())
          .post('/auth/register')
          .send(authDto)
          .expect(HttpStatus.CREATED)
          .end((err, res) => {
            if (err) return done(err);

            return done();
          });
      });

      it('throw exception if no credentials provided', (done) => {
        request(app.getHttpServer())
          .post('/auth/register')
          .send({})
          .expect(HttpStatus.BAD_REQUEST)
          .end((err, res) => {
            if (err) return done(err);

            return done();
          });
      });

      it('throw exception if credentials taken', (done) => {
        request(app.getHttpServer())
          .post('/auth/register')
          .send(authDto)
          .expect(HttpStatus.FORBIDDEN)
          .end((err, res) => {
            if (err) return done(err);

            return done();
          });
      });
    });

    describe('Login', () => {
      const loginDto: LoginDto = {
        email: authDto.email,
        password: authDto.password,
      };

      it('login to the created user', (done) => {
        request(app.getHttpServer())
          .post('/auth/login')
          .send(loginDto)
          .expect(HttpStatus.OK)
          .end((err, res) => {
            if (err) return done(err);

            access_token = res.body['access_token'];

            return done();
          });
      });

      it('throw exception if no credentials provided', (done) => {
        request(app.getHttpServer())
          .post('/auth/login')
          .send({})
          .expect(HttpStatus.BAD_REQUEST)
          .end((err, res) => {
            if (err) return done(err);

            return done();
          });
      });

      it('throw exception if credentials incorrect', (done) => {
        request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: loginDto.email,
            password: 'differentpassword',
          })
          .expect(HttpStatus.UNAUTHORIZED)
          .end((err, res) => {
            if (err) return done(err);

            return done();
          });
      });
    });
  });

  describe('User', () => {
    it('get user info', (done) => {
      request(app.getHttpServer())
        .get(`/user/${authDto.username}`)
        .set({ Authorization: 'Bearer ' + access_token })
        .expect(HttpStatus.OK)
        .expect(function (res) {
          res.body.email = authDto.email;
          res.body.username = authDto.username;
        })
        .end((err, res) => {
          if (err) return done(err);

          return done();
        });
    });

    it('throw exception if token not provided', (done) => {
      request(app.getHttpServer())
        .get(`/user/${authDto.username}`)
        .expect(HttpStatus.UNAUTHORIZED)
        .end((err, res) => {
          if (err) return done(err);

          console.log(res);

          return done();
        });
    });

    it('throw exception if token not valid', (done) => {
      request(app.getHttpServer())
        .get(`/user/${authDto.username}`)
        .set({ Authorization: 'Bearer ' + 'aksdjaljdklsd' })
        .expect(HttpStatus.UNAUTHORIZED)
        .end((err, res) => {
          if (err) return done(err);

          return done();
        });
    });
  });
});
