import { Member, Subreddit } from '@prisma/client';
import { StandardResponse } from '../../../common/types/standardResponse';
import { EXAMPLE_USER_ID } from '../../user/examples';

type ExampleSubreddit = Subreddit & {
  _count: {
    members?: number;
    posts?: number;
  };
};

const EXAMPLE_SUBREDDIT_1: ExampleSubreddit = {
  id: '78961915-3eb8-43e9-8702-d409e5ecdf20',
  name: 'subreddit-1',
  description: '#1 subreddit',
  avatar: null,
  createdAt: new Date('2022-11-15T10:46:29.640Z'),
  updatedAt: new Date('2022-11-15T10:46:46.640Z'),
  userId: EXAMPLE_USER_ID,

  _count: { members: 1, posts: 0 },
};

const EXAMPLE_SUBREDDIT_2: ExampleSubreddit = {
  id: '988c6238-d94f-4350-99cf-8d37571b8d71',
  name: 'subreddit-2',
  description: '#2 subreddit',
  avatar: null,
  createdAt: new Date('2022-11-15T10:48:29.640Z'),
  updatedAt: new Date('2022-11-15T10:50:14.640Z'),
  userId: '8a87f71a-1192-4ae8-8f74-88311c136486',
  _count: { members: 1, posts: 0 },
};

export const AllUserSubredditsExample: StandardResponse<Subreddit[]> = {
  success: true,
  data: [EXAMPLE_SUBREDDIT_1],
  count: 1,
};

export const AllSubredditsExample: StandardResponse<Subreddit[]> = {
  success: true,
  data: [EXAMPLE_SUBREDDIT_1, EXAMPLE_SUBREDDIT_2],
  count: 2,
};

export const SingleSubredditExample: StandardResponse<Subreddit> = {
  success: true,
  data: EXAMPLE_SUBREDDIT_1,
};

const EXAMPLE_MEMBER: Member = {
  id: '4ea984e6-ac5b-4915-8f0c-4b75fc514490',
  subredditId: EXAMPLE_SUBREDDIT_1.id,
  userId: EXAMPLE_USER_ID,
};

export const AllSubredditMembersExample: StandardResponse<Member[]> = {
  success: true,
  data: [EXAMPLE_MEMBER],
  count: 1,
};
