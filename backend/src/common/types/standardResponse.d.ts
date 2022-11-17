export class StandardResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
}

export class Token {
  access_token: string;
}
