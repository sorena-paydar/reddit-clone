import { Media, Post } from '@prisma/client';
import { StandardResponse } from '../../../common/types/standardResponse';
import { createSlug } from '../../../common/utils';
import { SingleSubredditExample } from '../../subreddit/examples';
import { SingleUserExample } from '../../user/examples';

type ExamplePost = Post & {
  Media: Media[];
};

const EXAMPLE_POST_1: ExamplePost = {
  id: '44e4c9f5-12d5-4ff9-815e-38285fe57254',
  title: 'Elimination of programmers',
  content: 'https://journal.media/elimination-of-programmers',
  slug: createSlug(
    'Elimination of programmers',
    {
      replacement: '_',
      remove: /[*+~.()'"!:@]/g,
      lower: true,
    },
    42,
  ),
  subredditId: SingleSubredditExample.data.id,
  userId: SingleUserExample.data.id,
  Media: [
    {
      id: '57a964e5-926a-40fc-8b3b-175d5672bf97',
      mediaUrl: 'posts/filename.png',
      createdAt: new Date('2022-11-24T15:55:38.968Z'),
      postId: '44e4c9f5-12d5-4ff9-815e-38285fe57254',
    },
  ],
  createdAt: new Date('2022-11-24T15:55:38.968Z'),
  updatedAt: new Date('2022-11-24T15:55:43.968Z'),
};

const EXAMPLE_POST_2: ExamplePost = {
  id: 'e5afb776-4ba8-4859-8839-17ec76da4c58',
  title:
    'Machine Learning Roadmap - a linear learning path to become a Machine Learning Engineer',
  content: 'https://journal.media/elimination-of-programmers',
  slug: createSlug(
    'Machine Learning Roadmap - a linear learning path to become a Machine Learning Engineer',
    {
      replacement: '_',
      remove: /[*+~.()'"!:@]/g,
      lower: true,
    },
    42,
  ),
  subredditId: SingleSubredditExample.data.id,
  userId: '2fd1f161-8f6c-4072-ab5c-f6a86af9c970',
  Media: [],
  createdAt: new Date('2022-11-24T15:57:21.968Z'),
  updatedAt: new Date('2022-11-24T15:58:02.968Z'),
};

export const AllUserPostsExample: StandardResponse<ExamplePost[]> = {
  success: true,
  data: [EXAMPLE_POST_1],
  count: 1,
};

export const AllPostsExample: StandardResponse<ExamplePost[]> = {
  success: true,
  data: [EXAMPLE_POST_1, EXAMPLE_POST_2],
  count: 2,
};

export const SinglePostExample: StandardResponse<ExamplePost> = {
  success: true,
  data: EXAMPLE_POST_1,
};
