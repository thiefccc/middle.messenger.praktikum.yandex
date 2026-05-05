import HTTPTransport from '../utils/HTTPTransport';
import { BaseAPI } from './BaseAPI';
import { API_BASE_URL } from './constants';
import type { SignInRequest, SignUpRequest, SignUpResponse, UserDTO } from './types';

const authInstance = new HTTPTransport(`${API_BASE_URL}/auth`);

class AuthService extends BaseAPI {
  public signIn(data: SignInRequest): Promise<unknown> {
    return authInstance.post('/signin', { data });
  }

  public signUp(data: SignUpRequest): Promise<SignUpResponse> {
    return authInstance.post<SignUpResponse>('/signup', { data });
  }

  public logout(): Promise<unknown> {
    return authInstance.post('/logout');
  }

  public getUser(): Promise<UserDTO> {
    return authInstance.get<UserDTO>('/user');
  }
}

export default new AuthService();
