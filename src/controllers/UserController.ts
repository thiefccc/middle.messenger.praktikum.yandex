import userService from '../api/UserService';
import store from '../framework/Store';
import { extractReason } from '../utils/extractReason';
import type { ChangePasswordRequest, UpdateProfileRequest } from '../api/types';

class UserController {
  public async updateProfile(data: UpdateProfileRequest): Promise<boolean> {
    store.setState('settings.error', null);
    try {
      const user = await userService.updateProfile(data);
      store.setState('user', user);
      return true;
    } catch (error) {
      store.setState('settings.error', extractReason(error, 'Не удалось обновить профиль'));
      return false;
    }
  }

  public async updatePassword(data: ChangePasswordRequest): Promise<boolean> {
    store.setState('settings.error', null);
    try {
      await userService.updatePassword(data);
      return true;
    } catch (error) {
      store.setState('settings.error', extractReason(error, 'Не удалось обновить пароль'));
      return false;
    }
  }

  public async updateAvatar(file: File): Promise<boolean> {
    store.setState('settings.error', null);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const user = await userService.updateAvatar(formData);
      store.setState('user', user);
      return true;
    } catch (error) {
      store.setState('settings.error', extractReason(error, 'Не удалось обновить аватар'));
      return false;
    }
  }

  public async searchByLogin(login: string): Promise<number | null> {
    try {
      const users = await userService.searchByLogin(login);
      const exact = users.find((u) => u.login === login);
      return exact ? exact.id : null;
    } catch {
      return null;
    }
  }
}

export default new UserController();
