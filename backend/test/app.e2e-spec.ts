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
    it('get user info', async () => {
      const response = await request(app.getHttpServer())
        .get(`/user/${authDto.username}`)
        .set({ Authorization: 'Bearer ' + access_token });

      expect(response.status).toEqual(HttpStatus.OK);
      expect(response.body.email).toEqual(authDto.email);
      expect(response.body.username).toEqual(authDto.username);
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

    it("thow exception if username in query param doesn't match with username of requested user", async () => {
      const response = await request(app.getHttpServer())
        .get(`/user/wrong-username`)
        .set({ Authorization: 'Bearer ' + access_token });

      expect(response.statusCode).toEqual(HttpStatus.NOT_FOUND);
    });

    it('update user', async () => {
      const updateUserDto = {
        username: 'sorena-paydar',
        displayName: 's0rena',
        bio: 'software developer',
        gender: 'Male',
      };

      const response = await request(app.getHttpServer())
        .patch(`/user/${authDto.username}`)
        .set({ Authorization: 'Bearer ' + access_token })
        .send(updateUserDto);

      expect(response.status).toEqual(HttpStatus.OK);
      expect(response.body.username).toEqual(updateUserDto.username);
      expect(response.body.displayName).toEqual(updateUserDto.displayName);
      expect(response.body.bio).toEqual(updateUserDto.bio);
      expect(response.body.gender).toEqual(updateUserDto.gender);
    });

    it('username (query param) check for user patch', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/user/wrong-username`)
        .set({ Authorization: 'Bearer ' + access_token });

      expect(response.status).toEqual(HttpStatus.NOT_FOUND);
    });
  });
});
