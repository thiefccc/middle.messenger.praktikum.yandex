import { WSTransport } from '../utils/WSTransport';
import { WS_BASE_URL } from '../api/constants';
import chatService from '../api/ChatService';
import store from '../framework/Store';
import { extractReason } from '../utils/extractReason';
import type { MessageDTO, UserDTO } from '../api/types';

const RECONNECT_DELAY_MS = 3000;
const NORMAL_CLOSE_CODE = 1000;

interface MessagesBranch {
  byChatId: Record<string, MessageDTO[]>;
  activeChatId: number | null;
  loading: boolean;
  error: string | null;
}

class MessagesController {
  private socket: WSTransport | null = null;
  private chatId: number | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private intentionalClose = false;

  public async open(chatId: number): Promise<void> {
    if (this.chatId === chatId && this.socket?.isOpen()) {
      return;
    }

    await this.close();

    const user = store.getState().user as UserDTO | null | undefined;
    if (!user) {
      store.setState('messages.error', 'Пользователь не авторизован');
      return;
    }

    store.setState('messages.activeChatId', chatId);
    store.setState('messages.loading', true);
    store.setState('messages.error', null);

    let token: string;
    try {
      const response = await chatService.getToken(chatId);
      token = response.token;
    } catch (error) {
      store.setState('messages.loading', false);
      store.setState(
        'messages.error',
        extractReason(error, 'Не удалось получить токен чата'),
      );
      return;
    }

    const url = `${WS_BASE_URL}/chats/${user.id}/${chatId}/${token}`;
    const socket = new WSTransport(url);

    this.bindSocketHandlers(socket, chatId);
    this.socket = socket;
    this.chatId = chatId;
    this.intentionalClose = false;

    try {
      await socket.connect();
      socket.send({ type: 'get old', content: '0' });
    } catch (error) {
      store.setState('messages.loading', false);
      store.setState(
        'messages.error',
        extractReason(error, 'Не удалось подключиться к чату'),
      );
      this.cleanup();
    }
  }

  public async close(): Promise<void> {
    this.intentionalClose = true;
    this.clearReconnect();
    this.cleanup();
    store.setState('messages.activeChatId', null);
    store.setState('messages.loading', false);
  }

  public sendMessage(content: string): boolean {
    const trimmed = content.trim();
    if (!trimmed) {
      return false;
    }

    if (!this.socket?.isOpen()) {
      store.setState(
        'messages.error',
        'Соединение разорвано, переподключение...',
      );
      return false;
    }

    try {
      this.socket.send({ type: 'message', content: trimmed });
      return true;
    } catch (error) {
      store.setState(
        'messages.error',
        extractReason(error, 'Не удалось отправить сообщение'),
      );
      return false;
    }
  }

  private bindSocketHandlers(socket: WSTransport, chatId: number): void {
    socket.onMessage = (data: unknown) => {
      if (Array.isArray(data)) {
        this.mergeHistory(chatId, data as MessageDTO[]);
        store.setState('messages.loading', false);
        return;
      }
      if (this.isMessageDTO(data)) {
        this.appendLive(chatId, data);
      }
    };

    socket.onClose = (event: CloseEvent) => {
      if (this.chatId !== chatId) {
        return;
      }
      if (this.intentionalClose || event.code === NORMAL_CLOSE_CODE) {
        return;
      }

      store.setState(
        'messages.error',
        'Соединение прервано, попытка переподключения…',
      );
      this.scheduleReconnect(chatId);
    };

    socket.onError = () => {
      if (this.chatId === chatId) {
        store.setState('messages.error', 'Ошибка соединения с чатом');
      }
    };
  }

  private scheduleReconnect(chatId: number): void {
    this.clearReconnect();
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.chatId === chatId && !this.intentionalClose) {
        void this.open(chatId);
      }
    }, RECONNECT_DELAY_MS);
  }

  private clearReconnect(): void {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private mergeHistory(chatId: number, items: MessageDTO[]): void {
    const next = this.removeDuplicatesAndSort([
      ...items,
      ...this.getMessagesFor(chatId),
    ]);
    store.setState(`messages.byChatId.${chatId}`, next);
  }

  private appendLive(chatId: number, message: MessageDTO): void {
    const next = this.removeDuplicatesAndSort([
      ...this.getMessagesFor(chatId),
      message,
    ]);
    store.setState(`messages.byChatId.${chatId}`, next);
  }

  private removeDuplicatesAndSort(messages: MessageDTO[]): MessageDTO[] {
    const byKey = new Map<string, MessageDTO>();
    for (const message of messages) {
      byKey.set(this.messageKey(message), message);
    }
    return Array.from(byKey.values()).sort(
      (a, b) => Date.parse(a.time) - Date.parse(b.time),
    );
  }

  private getMessagesFor(chatId: number): MessageDTO[] {
    const branch = store.getState().messages as
      | Partial<MessagesBranch>
      | undefined;
    return branch?.byChatId?.[String(chatId)] ?? [];
  }

  private isMessageDTO(data: unknown): data is MessageDTO {
    if (!data || typeof data !== 'object') {
      return false;
    }
    const obj = data as Record<string, unknown>;
    return (
      obj.type === 'message' || obj.type === 'file' || obj.type === 'sticker'
    );
  }

  private messageKey(message: MessageDTO): string {
    if (message.id !== undefined && message.id !== null) {
      return String(message.id);
    }
    return `${message.user_id}-${message.time}-${message.content}`;
  }

  private cleanup(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.chatId = null;
  }
}

export default new MessagesController();
