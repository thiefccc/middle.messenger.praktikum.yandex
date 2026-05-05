import HTTPTransport from '../utils/HTTPTransport';
import { BaseAPI } from './BaseAPI';
import { API_BASE_URL } from './constants';
import type {
  ChatDTO,
  ChatUserDTO,
  ChatUsersRequest,
  CreateChatRequest,
  CreateChatResponse,
} from './types';

const chatInstance = new HTTPTransport(`${API_BASE_URL}/chats`);

class ChatService extends BaseAPI {
  public list(): Promise<ChatDTO[]> {
    return chatInstance.get<ChatDTO[]>('');
  }

  public create(data: CreateChatRequest): Promise<CreateChatResponse> {
    return chatInstance.post<CreateChatResponse>('', { data });
  }

  public deleteChat(chatId: number): Promise<unknown> {
    return chatInstance.delete('', { data: { chatId } });
  }

  public addUsers(data: ChatUsersRequest): Promise<unknown> {
    return chatInstance.put('/users', { data });
  }

  public removeUsers(data: ChatUsersRequest): Promise<unknown> {
    return chatInstance.delete('/users', { data });
  }

  public getUsers(chatId: number): Promise<ChatUserDTO[]> {
    return chatInstance.get<ChatUserDTO[]>(`/${chatId}/users`);
  }

  public updateAvatar(formData: FormData): Promise<ChatDTO> {
    return chatInstance.put<ChatDTO>('/avatar', { data: formData });
  }

  public getToken(chatId: number): Promise<{ token: string }> {
    return chatInstance.post<{ token: string }>(`/token/${chatId}`);
  }
}

export default new ChatService();
