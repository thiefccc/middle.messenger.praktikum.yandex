import HTTPTransport from '../utils/HTTPTransport';
import { BaseAPI } from './BaseAPI';
import { API_BASE_URL } from './constants';
import type { ChangePasswordRequest, UpdateProfileRequest, UserDTO } from './types';

const userInstance = new HTTPTransport(`${API_BASE_URL}/user`);

class UserService extends BaseAPI {
  public updateProfile(data: UpdateProfileRequest): Promise<UserDTO> {
    return userInstance.put<UserDTO>('/profile', { data });
  }

  public updatePassword(data: ChangePasswordRequest): Promise<unknown> {
    return userInstance.put('/password', { data });
  }

  public updateAvatar(formData: FormData): Promise<UserDTO> {
    return userInstance.put<UserDTO>('/profile/avatar', { data: formData });
  }

  public searchByLogin(login: string): Promise<UserDTO[]> {
    return userInstance.post<UserDTO[]>('/search', { data: { login } });
  }
}

export default new UserService();
