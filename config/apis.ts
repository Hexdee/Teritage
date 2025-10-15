import client from '@/lib/axios-instance';
import { ApiResponse, CreateTeritagePlanRequest, UpdateTeritagePlanRequest } from '@/type';

export const userSignUp = (payload: { email: string }): Promise<ApiResponse> =>
  client.post('/auth/signup/request-code', payload).then((response) => response.data);

export const userLogin = (payload: { email: string; password: string }): Promise<ApiResponse> =>
  client.post('/auth/signin', payload).then((response) => response.data);

export const userSignUpVerify = (payload: { email: string; code: string }): Promise<ApiResponse> =>
  client.post('/auth/signup/verify', payload).then((response) => response.data);

export const userSetPassword = (payload: { email: string; password: string; verificationToken: string }): Promise<ApiResponse> =>
  client.post('/auth/signup/set-password', payload).then((response) => response.data);

export const userSetUsername = (payload: { username: string }): Promise<ApiResponse> =>
  client.post('/auth/username', payload).then((response) => response.data);

export const createTeritagePlanApi = (payload: CreateTeritagePlanRequest): Promise<ApiResponse> =>
  client.post('/teritages', payload).then((response) => response.data);

export const getTeritagePlanApi = (ownerAddress: string): Promise<ApiResponse> => client.get(`/teritages/${ownerAddress}`).then((response) => response.data);

export const updateTeritagePlanApi = (ownerAddress: string, payload: UpdateTeritagePlanRequest): Promise<ApiResponse> =>
  client.put(`/teritages/${ownerAddress}`, payload).then((response) => response.data);

export const recordCheckInApi = (ownerAddress: string, payload: { triggeredBy?: string; note?: string; timestamp?: string } = {}): Promise<ApiResponse> =>
  client.post(`/teritages/${ownerAddress}/checkins`, payload).then((response) => response.data);

export const recordClaimApi = (ownerAddress: string, payload: { initiatedBy: string; note?: string }): Promise<ApiResponse> =>
  client.post(`/teritages/${ownerAddress}/claims`, payload).then((response) => response.data);

export const listTeritageActivitiesApi = (ownerAddress: string): Promise<ApiResponse> =>
  client.get(`/teritages/${ownerAddress}/activities`).then((response) => response.data);

export const listTeritageCheckInsApi = (ownerAddress: string): Promise<ApiResponse> =>
  client.get(`/teritages/${ownerAddress}/checkins`).then((response) => response.data);

export const getLatestCheckInApi = (ownerAddress: string): Promise<ApiResponse> =>
  client.get(`/teritages/${ownerAddress}/checkins/latest`).then((response) => response.data);

export const getWalletTokensApi = (accountId: string): Promise<ApiResponse> =>
  client.get('/wallets/tokens', { params: { accountId } }).then((response) => response.data);

export const getWalletSummaryApi = (ownerAddress: string, accountId: string): Promise<ApiResponse> =>
  client.get(`/wallets/${ownerAddress}/summary`, { params: { accountId } }).then((response) => response.data);

export const getUserTeritageApi = (ownerAddress: string): Promise<ApiResponse> => client.get(`/teritages/${ownerAddress}`).then((response) => response.data);

export const getTokenSummaryApi = (ownerAddress: string): Promise<ApiResponse> =>
  client.get(`/wallets/${ownerAddress}/summary`, { params: { accountId: ownerAddress } }).then((response) => response.data);

export const getWalletTokenApi = (ownerAddress: string): Promise<ApiResponse> =>
  client.get(`/wallets/tokens`, { params: { accountId: ownerAddress } }).then((response) => response.data);

export const getActivities = (ownerAddress: string): Promise<ApiResponse> =>
  client.get(`/teritages/${ownerAddress}/activities`).then((response) => response.data);
