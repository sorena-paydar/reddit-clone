import {
  StandardResponse,
  Token,
} from '../../../common/types/standardResponse';

const EXAMPLE_AUTH: Token = {
  access_token:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwM2I1OWJmZS1jNDI0LTQ5ZjMtOWI2Mi00YzIzMTM2OTA2ZDciLCJlbWFpbCI6InNvcmVuYS1wYXlkYXJAZXhhbXBsZS5jb20iLCJpYXQiOjE1MTYyMzkwMjJ9.nhttjJLo2Y5wSldVKxoOtfDxwCis0cVGO8m4kKqj75I',
};

export const AuthExample: StandardResponse<Token> = {
  success: true,
  data: {
    access_token: EXAMPLE_AUTH.access_token,
  },
};
