import authService from '../api/AuthService';
import store from '../framework/Store';
import { Router } from '../framework/Router';
import { extractReason } from '../utils/extractReason';
import messagesController from './MessagesController';
import type { SignInRequest, SignUpRequest, UserDTO } from '../api/types';

function getRouter(): Router {
  return new Router('');
}

function isUserDTO(value: unknown): value is UserDTO {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as UserDTO).id === 'number' &&
    typeof (value as UserDTO).login === 'string'
  );
}

class AuthController {
  public async login(data: SignInRequest): Promise<void> {
    store.setState('auth.error', null);
    try {
      await authService.signIn(data);
      const ok = await this.fetchUser();
      if (!ok) {
        store.setState('auth.error', 'Не удалось получить данные пользователя');
        return;
      }
      getRouter().go('/messenger');
    } catch (error) {
      store.setState('auth.error', extractReason(error, 'Не удалось войти'));
    }
  }

  public async register(data: SignUpRequest): Promise<void> {
    store.setState('auth.error', null);
    try {
      await authService.signUp(data);
      const ok = await this.fetchUser();
      if (!ok) {
        store.setState('auth.error', 'Не удалось получить данные пользователя');
        return;
      }
      getRouter().go('/messenger');
    } catch (error) {
      store.setState(
        'auth.error',
        extractReason(error, 'Не удалось зарегистрироваться'),
      );
    }
  }

  public async logout(): Promise<void> {
    try {
      await authService.logout();
    } catch {
      // continue with local cleanup even if server failed
    }
    await messagesController.close();
    store.setState('user', null);
    getRouter().go('/');
  }

  public async fetchUser(): Promise<boolean> {
    try {
      const user = await authService.getUser();
      if (!isUserDTO(user)) {
        store.setState('user', null);
        return false;
      }
      store.setState('user', user);
      return true;
    } catch {
      store.setState('user', null);
      return false;
    }
  }
}

export default new AuthController();
