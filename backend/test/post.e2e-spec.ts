import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Post } from '@prisma/client';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { RegisterDto } from '../src/app/auth/dto';
import { CreatePostDto, UpdatePostDto } from '../src/app/post/dto';
import { PrismaService } from '../src/app/prisma/prisma.service';
import { CreateSubredditDto } from '../src/app/subreddit/dto';

const mockUser: RegisterDto = {
  email: 'asd@gmail.com',
  username: 'asd',
  password: '123',
};

const mockSubreddit: CreateSubredditDto = {
  name: 'nodejs',
  description: 'blah blah blah',
};

const mockPost: CreatePostDto = {
  title: 'Clean Code',
  content: 'link to a website',
};

describe('/r/{subredditName}', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let access_token: string;
  let post: Post;

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

    // Create user and save token (/auth/register)
    const authResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send(mockUser)
      .expect(HttpStatus.CREATED);

    expect(authResponse.body.success).toEqual(true);

    access_token = authResponse.body.data['access_token'];

    // Create a new subreddit
    const subredditResponse = await request(app.getHttpServer())
      .post('/r')
      .set({
        Authorization: 'Bearer ' + access_token,
      })
      .send(mockSubreddit)
      .expect(HttpStatus.CREATED);

    expect({
      success: subredditResponse.body.success,
      data: {
        name: subredditResponse.body.data.name,
        description: subredditResponse.body.data.description,
      },
    }).toEqual({
      success: true,
      data: mockSubreddit,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('/r/{subredditName}/submit POST', async () => {
    const response = await request(app.getHttpServer())
      .post(`/r/${mockSubreddit.name}/submit`)
      .set({ Authorization: 'Bearer ' + access_token })
      .send(mockPost)
      .expect(HttpStatus.CREATED);

    expect({
      success: response.body.success,
      data: {
        title: response.body.data.title,
        content: response.body.data.content,
      },
    }).toEqual({
      success: true,
      data: mockPost,
    });

    post = response.body.data;
  });

  it('/r/{subredditName}/comments/{slug} GET', async () => {
    const response = await request(app.getHttpServer())
      .get(`/r/${mockSubreddit.name}/comments/${post.slug}`)
      .expect(HttpStatus.OK);

    expect(response.body.success).toEqual(true);
    expect(response.body.data).toEqual(post);
  });

  it('/r/{subredditName}/posts GET', async () => {
    const response = await request(app.getHttpServer())
      .get(`/r/${mockSubreddit.name}/posts`)
      .expect(HttpStatus.OK);

    expect(response.body.success).toEqual(true);
    expect(response.body.data).toEqual([post]);
    expect(response.body.count).toEqual(1);
  });

  it('/r/{subredditName}/comments/{slug} PATCH', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/r/${mockSubreddit.name}/comments/${post.slug}`)
      .set({ Authorization: 'Bearer ' + access_token })
      .send({
        title: 'sorena',
      } as UpdatePostDto)
      .expect(HttpStatus.OK);

    expect(response.body.success).toEqual(true);
    expect({ title: response.body.data.title }).toEqual({ title: 'sorena' });

    post = response.body.data;
  });

  it('/r/{subredditName}/comments/{id}/upvote', async () => {
    const response = await request(app.getHttpServer())
      .post(`/r/${mockSubreddit.name}/comments/${post.id}/upvote`)
      .set({ Authorization: 'Bearer ' + access_token })
      .expect(HttpStatus.OK);

    expect(response.body.success).toEqual(true);
    expect(response.body.data.upvotes).toEqual(post.upvotes + 1);
    expect(response.body.data.downvotes).toEqual(post.downvotes);
  });

  it('/r/{subredditName}/comments/{id}/downvote', async () => {
    const response = await request(app.getHttpServer())
      .post(`/r/${mockSubreddit.name}/comments/${post.id}/downvote`)
      .set({ Authorization: 'Bearer ' + access_token })
      .expect(HttpStatus.OK);

    expect(response.body.success).toEqual(true);
    expect(response.body.data.upvotes).toEqual(post.upvotes);
    expect(response.body.data.downvotes).toEqual(post.downvotes + 1);
  });

  it('/r/{subredditName}/post/{id} DELETE', async () => {
    await request(app.getHttpServer())
      .delete(`/r/${mockSubreddit.name}/post/${post.id}`)
      .set({ Authorization: 'Bearer ' + access_token })
      .expect(HttpStatus.NO_CONTENT);

    // Check if post has been deleted or not
    await request(app.getHttpServer())
      .get(`/r/${mockSubreddit.name}/comments/${post.slug}`)
      .expect(HttpStatus.NOT_FOUND);
  });
});
