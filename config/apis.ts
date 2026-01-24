import client from '@/lib/axios-instance';
import {
  ApiResponse,
  ChangePasswordRequest,
  ChangePinRequest,
  CreatePinRequest,
  CreateTeritagePlanRequest,
  ICheckIn,
  PinVerificationResponse,
  UpdateTeritagePlanRequest,
  UpdateUserProfileRequest,
  UpdateWalletAddressesRequest,
  UserProfile,
  VerifyPinRequest,
  WalletSummaryResponse,
  WalletTokensResponse,
} from '@/type';

export const userSignUp = (payload: { email: string }): Promise<ApiResponse> =>
  client.post('/auth/signup/request-code', payload).then((response) => response.data);

export const userLogin = (payload: { email: string; password: string }): Promise<ApiResponse> =>
  client.post('/auth/signin', payload).then((response) => response.data);

export const userForgotPassword = (payload: { email: string }): Promise<ApiResponse> =>
  client.post('/auth/password/forgot', payload).then((response) => response.data);

export const userForgotPasswordVerify = (payload: { email: string; code: string }): Promise<ApiResponse> =>
  client.post('/auth/password/verify', payload).then((response) => response.data);

export const userSignUpVerify = (payload: { email: string; code: string }): Promise<ApiResponse> =>
  client.post('/auth/signup/verify', payload).then((response) => response.data);

export const userSetPassword = (payload: { email: string; password: string; verificationToken: string }): Promise<ApiResponse> =>
  client.post('/auth/signup/set-password', payload).then((response) => response.data);

export const userResetPassword = (payload: { email: string; password: string; verificationToken: string }): Promise<ApiResponse> =>
  client.post('/auth/password/reset', payload).then((response) => response.data);

export const userSetUsername = (payload: { username: string }): Promise<ApiResponse> =>
  client.post('/auth/username', payload).then((response) => response.data);

export const createTeritagePlanApi = (payload: CreateTeritagePlanRequest): Promise<ApiResponse> =>
  client.post('/teritages', payload).then((response) => response.data);

export const getTeritagePlanApi = (): Promise<ApiResponse> => client.get('/teritages').then((response) => response.data);

export const updateTeritagePlanApi = (payload: UpdateTeritagePlanRequest): Promise<ApiResponse> =>
  client.patch('/teritages', payload).then((response) => response.data);

export const recordCheckInApi = (payload: { triggeredBy?: string; note?: string; timestamp?: string } = {}): Promise<ApiResponse> =>
  client.post(`/teritages/checkins`, payload).then((response) => response.data);

export const listTeritageActivitiesApi = (): Promise<ApiResponse> => client.get(`/teritages/activities`).then((response) => response.data);

export const listTeritageCheckInsApi = (): Promise<ApiResponse> => client.get(`/teritages/checkins`).then((response) => response.data);

export const getLatestCheckInApi = (): Promise<ApiResponse> => client.get(`/teritages/checkins/latest`).then((response) => response.data);

export const getWalletTokensApi = (ownerAddress: string): Promise<WalletTokensResponse> =>
  client.get(`/wallets/${ownerAddress}/tokens`).then((response) => response.data);

export const getWalletSummaryApi = (ownerAddress: string): Promise<WalletSummaryResponse> =>
  client.get(`/wallets/${ownerAddress}/summary`).then((response) => response.data);

export const getUserTeritageApi = (): Promise<ApiResponse> => getTeritagePlanApi();

export const getUserProfileApi = (): Promise<{ user: UserProfile }> => client.get('/user/profile').then((response) => response.data);

export const updateUserProfileApi = (payload: UpdateUserProfileRequest): Promise<{ user: UserProfile }> =>
  client.patch('/user/profile', payload).then((response) => response.data);

export const getWalletTokenApi = (ownerAddress: string): Promise<ApiResponse> =>
  client.get(`/wallets/tokens`, { params: { accountId: ownerAddress } }).then((response) => response.data);

export const getActivities = (ownerAddress: string): Promise<ApiResponse> =>
  client.get(`/teritages/${ownerAddress}/activities`).then((response) => response.data);
export const changePasswordApi = (payload: ChangePasswordRequest): Promise<{ message: string }> =>
  client.patch('/user/password', payload).then((response) => response.data);

export const verifyPinApi = (payload: VerifyPinRequest): Promise<PinVerificationResponse> =>
  client.post('/user/pin/verify', payload).then((response) => response.data);

export const changePinApi = (payload: ChangePinRequest): Promise<{ message: string }> => client.patch('/user/pin', payload).then((response) => response.data);

export const updateWalletAddressesApi = (payload: UpdateWalletAddressesRequest): Promise<{ user: UserProfile }> =>
  client.patch('/user/wallets', payload).then((response) => response.data);

export const createPinApi = (payload: CreatePinRequest): Promise<{ message: string }> => client.post('/user/pin', payload).then((response) => response.data);

export const usercheckIn = (payload: { triggeredBy: string; note: string; timestamp: string }): Promise<{ message: string }> =>
  client.post('/teritages/checkins', payload).then((response) => response.data);

export const getCheckIns = (): Promise<ICheckIn> => client.get('teritages/checkins').then((response) => response.data);

export const getNotifications = (): Promise<ApiResponse> => client.get('/notifications').then((response) => response.data);

export const claimLookup = (payload: { ownerEmail: string; beneficiaryEmail: string }): Promise<{ ownerAddress: string; inheritorIndex: number; secretQuestion: string }> =>
  client.post('/claims/lookup', payload).then((response) => response.data);

export const claimVerify = (payload: { ownerAddress: string; inheritorIndex: number; secretAnswer: string }): Promise<{ valid: boolean }> =>
  client.post('/claims/verify', payload).then((response) => response.data);

export const claimSubmit = (payload: { ownerAddress: string; inheritorIndex: number; secretAnswer: string; beneficiaryWallet: string }): Promise<{ resolvedTxHash: string; claimable: boolean; claimTxHash?: string | null }> =>
  client.post('/claims/submit', payload).then((response) => response.data);
