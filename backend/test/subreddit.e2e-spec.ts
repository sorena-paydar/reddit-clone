import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { RegisterDto } from '../src/app/auth/dto';
import { PrismaService } from '../src/app/prisma/prisma.service';
import {
  CreateSubredditDto,
  UpdateSubredditDto,
} from '../src/app/subreddit/dto';

const authDto: RegisterDto = {
  email: 'spinuza@gmail.com',
  username: 'spinuza',
  password: 'strongpassword',
};

let subreddit: CreateSubredditDto = {
  name: 'coding',
  description: 'Welcome to coding',
};

describe('/r', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let access_token: string;
  let subreddit_id: string;

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
      body: { data },
    } = await request(app.getHttpServer())
      .post('/auth/register')
      .send(authDto)
      .expect(HttpStatus.CREATED);

    access_token = data['access_token'];
  });

  afterAll(async () => {
    await app.close();
  });

  it('/r GET', async () => {
    const { body } = await request(app.getHttpServer())
      .get('/r')
      .expect(HttpStatus.OK);

    expect(body).toEqual({
      success: true,
      data: [],
      count: 0,
    });
  });

  it('/r POST', async () => {
    const {
      body: { success, data },
    } = await request(app.getHttpServer())
      .post('/r')
      .set({ Authorization: 'Bearer ' + access_token })
      .send(subreddit)
      .expect(HttpStatus.CREATED);

    expect({
      success,
      data: {
        name: data.name,
        description: data.description,
      },
    }).toEqual({
      success: true,
      data: subreddit,
    });
  });

  it('/r/{name} GET', async () => {
    const {
      body: { success, data },
    } = await request(app.getHttpServer())
      .get(`/r/${subreddit.name}`)
      .expect(HttpStatus.OK);

    expect({
      success,
      data: {
        name: data.name,
        description: data.description,
      },
    }).toEqual({
      success: true,
      data: subreddit,
    });

    subreddit_id = data['id'];
  });

  it('/r/{id} PATCH', async () => {
    subreddit = {
      name: 'spinuza',
      description: "it's me",
    };

    const {
      body: { success, data },
    } = await request(app.getHttpServer())
      .patch(`/r/${subreddit_id}`)
      .set({ Authorization: 'Bearer ' + access_token })
      .send(subreddit as UpdateSubredditDto)
      .expect(HttpStatus.OK);

    expect({
      success,
      data: {
        name: data.name,
        description: data.description,
      },
    }).toEqual({
      success: true,
      data: subreddit,
    });
  });

  it('/r/{id} DELETE', async () => {
    await request(app.getHttpServer())
      .delete(`/r/${subreddit_id}`)
      .set({ Authorization: 'Bearer ' + access_token })
      .expect(HttpStatus.NO_CONTENT);
  });
});
