export interface StandardResponse<T> {
  success: boolean;
  data?: T;
}

export interface Token {
  access_token: string;
}
