import chatService from '../api/ChatService';
import userController from './UserController';
import messagesController from './MessagesController';
import store from '../framework/Store';
import { extractReason } from '../utils/extractReason';
import type { ChatDTO } from '../api/types';

const MESSENGER_BASE_PATH = '/messenger';

class ChatController {
  private popstateBound = false;

  public async fetchChats(): Promise<void> {
    store.setState('chats.error', null);
    try {
      const chats = await chatService.list();
      store.setState('chats.list', chats);
      this.bindPopstateOnce();
      this.restoreActiveChatFromUrl(chats);
    } catch (error) {
      store.setState(
        'chats.error',
        extractReason(error, 'Не удалось загрузить чаты'),
      );
    }
  }

  public async createChat(title: string): Promise<boolean> {
    store.setState('chats.error', null);
    try {
      await chatService.create({ title });
      await this.fetchChats();
      return true;
    } catch (error) {
      store.setState(
        'chats.error',
        extractReason(error, 'Не удалось создать чат'),
      );
      return false;
    }
  }

  public async deleteChat(chatId: number): Promise<boolean> {
    try {
      await chatService.deleteChat(chatId);
      await this.selectChat(null, 'replace');
      await this.fetchChats();
      return true;
    } catch (error) {
      store.setState(
        'chats.error',
        extractReason(error, 'Не удалось удалить чат'),
      );
      return false;
    }
  }

  public async addUserByLogin(login: string, chatId: number): Promise<boolean> {
    store.setState('chats.error', null);
    const userId = await userController.searchByLogin(login);
    if (userId === null) {
      store.setState('chats.error', `Пользователь "${login}" не найден`);
      return false;
    }

    try {
      await chatService.addUsers({ users: [userId], chatId });
      await this.fetchChatUsers(chatId);
      return true;
    } catch (error) {
      store.setState(
        'chats.error',
        extractReason(error, 'Не удалось добавить пользователя'),
      );
      return false;
    }
  }

  public async removeUserByLogin(
    login: string,
    chatId: number,
  ): Promise<boolean> {
    store.setState('chats.error', null);
    const userId = await userController.searchByLogin(login);
    if (userId === null) {
      store.setState('chats.error', `Пользователь "${login}" не найден`);
      return false;
    }

    try {
      await chatService.removeUsers({ users: [userId], chatId });
      await this.fetchChatUsers(chatId);
      return true;
    } catch (error) {
      store.setState(
        'chats.error',
        extractReason(error, 'Не удалось удалить пользователя'),
      );
      return false;
    }
  }

  public async fetchChatUsers(chatId: number): Promise<void> {
    try {
      const users = await chatService.getUsers(chatId);
      store.setState('chats.activeUsers', users);
    } catch (error) {
      store.setState(
        'chats.error',
        extractReason(error, 'Не удалось загрузить участников'),
      );
    }
  }

  public async selectChat(
    chatId: number | null,
    mode: 'push' | 'replace' = 'push',
  ): Promise<void> {
    store.setState('chats.activeId', chatId);
    store.setState('chats.activeUsers', []);
    this.persistActiveChatInUrl(chatId, mode);
    if (chatId !== null) {
      await this.fetchChatUsers(chatId);
      void messagesController.open(chatId);
    } else {
      void messagesController.close();
    }
  }

  private persistActiveChatInUrl(
    chatId: number | null,
    mode: 'push' | 'replace' = 'push',
  ): void {
    if (!window.location.pathname.startsWith(MESSENGER_BASE_PATH)) {
      return;
    }
    const target =
      chatId !== null
        ? `${MESSENGER_BASE_PATH}/${chatId}`
        : MESSENGER_BASE_PATH;
    if (target === window.location.pathname) {
      return;
    }
    if (mode === 'replace') {
      window.history.replaceState({}, '', target);
    } else {
      window.history.pushState({}, '', target);
    }
  }

  private bindPopstateOnce(): void {
    if (this.popstateBound) {
      return;
    }
    this.popstateBound = true;
    window.addEventListener('popstate', () => {
      const chats =
        (store.getState().chats as { list?: ChatDTO[] } | undefined)?.list ??
        [];
      this.syncActiveChatFromUrl(chats);
    });
  }

  private restoreActiveChatFromUrl(chats: ChatDTO[]): void {
    this.syncActiveChatFromUrl(chats);
  }

  private syncActiveChatFromUrl(chats: ChatDTO[]): void {
    if (!window.location.pathname.startsWith(MESSENGER_BASE_PATH)) {
      return;
    }

    const match = window.location.pathname.match(/^\/messenger\/(\d+)$/);
    const urlId = match ? Number(match[1]) : null;
    const currentId =
      (store.getState().chats as { activeId?: number | null } | undefined)
        ?.activeId ?? null;

    if (urlId === currentId) {
      return;
    }

    if (urlId !== null && !chats.some((c) => c.id === urlId)) {
      this.persistActiveChatInUrl(null, 'replace');
      return;
    }

    void this.selectChat(urlId, 'replace');
  }
}

export default new ChatController();
