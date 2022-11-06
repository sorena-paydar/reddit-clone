export interface StandardResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
}

export interface Token {
  access_token: string;
}
