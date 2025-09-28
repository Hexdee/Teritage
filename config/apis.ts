import client from '@/lib/axios-instance';
import { ApiResponse } from '@/type';

export const userSignUp = (payload: { email: string }): Promise<ApiResponse> =>
  client.post('/auth/signup/request-code', payload).then((response) => response.data);

export const userSignUpVerify = (payload: { email: string; code: string }): Promise<ApiResponse> =>
  client.post('/auth/signup/verify', payload).then((response) => response.data);

export const userSetPassword = (payload: { email: string; password: string; verificationToken: string }): Promise<ApiResponse> =>
  client.post('/auth/signup/set-password', payload).then((response) => response.data);

export const userSetUsername = (payload: { username: string }): Promise<ApiResponse> =>
  client.post('/auth/username', payload).then((response) => response.data);
