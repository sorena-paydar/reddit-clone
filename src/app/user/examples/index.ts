import { User } from '@prisma/client';
import { StandardResponse } from '../../../common/types/standardResponse';

export const EXAMPLE_USER_ID = 'faf2c68b-b705-4f77-89c4-ed253bc4b22b';

type ExampleUser = Omit<User, 'password'>;

const EXAMPLE_USER: ExampleUser = {
  id: EXAMPLE_USER_ID,
  email: 'sorena@example.com',
  username: 'sorena-paydar',
  displayName: 'sorena',
  bio: 'software engineer',
  gender: 'Male',
  avatar: null,
  emailVerified: false,
  createdAt: new Date('2022-11-15T14:07:49.233Z'),
  updatedAt: new Date('2022-11-15T14:20:33.332Z'),
};

export const SingleUserExample: StandardResponse<ExampleUser> = {
  success: true,
  data: EXAMPLE_USER,
};
