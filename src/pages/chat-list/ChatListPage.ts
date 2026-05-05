import { Block } from '../../framework/Block';
import { connect } from '../../framework/connect';
import chatController from '../../controllers/ChatController';
import { RESOURCES_BASE_URL } from '../../api/constants';
import type { Indexed } from '../../types/indexed';
import type { ChatDTO, ChatUserDTO } from '../../api/types';
import './chat-list.scss';
import '../chat/chat.scss';

interface ChatListItemView {
  id: number;
  title: string;
  letter: string;
  avatarUrl: string;
  hasAvatar: boolean;
  lastMessage: string;
  unreadCount: number;
  isActive: boolean;
}

interface ActiveChatView {
  id: number;
  title: string;
  letter: string;
  avatarUrl: string;
}

interface MessengerPageProps {
  chatItems?: ChatListItemView[];
  activeChat?: ActiveChatView | null;
  activeUsers?: ChatUserDTO[];
  activeUsersCountText?: string;
  activeUsersText?: string;
  chatsError?: string | null;
}

class MessengerPage extends Block<MessengerPageProps> {
  static componentName = 'MessengerPage';

  private chatsFetched = false;

  constructor(props: MessengerPageProps = {}) {
    super(props);
  }

  protected template = `
    <main class="messenger">
      <aside class="chat-list">
        <nav class="chat-list__header">
          <h1 class="chat-list__title">Чаты</h1>
          {{{ Link label="Профиль" page="/settings" }}}
        </nav>
        <div class="chat-list__search">
          {{{ Input className="input-search" type="text" name="search" placeholder="Поиск" }}}
        </div>
        <ul class="chat-list__items">
          {{#each chatItems}}
          <li class="chat-item {{#if isActive}}chat-item--active{{/if}}" data-chat-id="{{id}}">
            {{#if hasAvatar}}
              <img class="avatar" src="{{avatarUrl}}" alt="avatar" />
            {{else}}
              <div class="avatar">{{letter}}</div>
            {{/if}}
            <div class="chat-item__info">
              <span class="chat-item__name">{{title}}</span>
              <span class="chat-item__message">{{lastMessage}}</span>
            </div>
            {{#if unreadCount}}<span class="chat-item__badge">{{unreadCount}}</span>{{/if}}
          </li>
          {{/each}}
        </ul>
        {{#if chatsError}}<p class="chat-list__error">{{chatsError}}</p>{{/if}}
        <div class="chat-list__footer">
          {{{ Button label="+ Новый чат" type="button" className="button-secondary" ref="createChatBtn" }}}
        </div>
      </aside>

      {{#if activeChat}}
      <section class="chat">
        <header class="chat__header">
          {{{ Avatar src=activeChat.avatarUrl letter=activeChat.letter }}}
          <div class="chat__title">
            <h2 class="chat__name">{{activeChat.title}}</h2>
            {{#if activeUsersCountText}}<p class="chat__users-count">{{activeUsersCountText}}</p>{{/if}}
          </div>
          <div class="chat__controls">
            {{{ Button label="+ Друг" type="button" className="button-secondary" ref="addUserBtn" }}}
            {{{ Button label="− Друг" type="button" className="button-secondary" ref="removeUserBtn" }}}
            {{{ Button label="Дроп чат" type="button" className="button-danger" ref="deleteChatBtn" }}}
          </div>
        </header>

        {{#if activeUsers.length}}
        <ul class="chat-users">
          {{#each activeUsers}}
          <li class="chat-users__item">
            {{#if avatarUrl}}
              <img class="avatar avatar--sm" src="{{avatarUrl}}" alt="avatar" />
            {{else}}
              <div class="avatar avatar--sm">{{letter}}</div>
            {{/if}}
            <span class="chat-users__name">{{viewName}}</span>
            {{#if isAdmin}}<span class="chat-users__role">admin</span>{{/if}}
          </li>
          {{/each}}
        </ul>
        {{/if}}

        <section class="chat__messages">
          <p class="chat__placeholder">Реал-тайм сообщения будут добавлены в следующем спринте.</p>
        </section>

        {{!-- TODO: wire this form to the websocket message API once it is available --}}
        <footer class="chat__footer">
          <form class="chat__form" ref="messageForm">
            <input class="input-chat" type="text" name="message" placeholder="Сообщение..." />
            <button class="button-send" type="submit">Отправить</button>
          </form>
        </footer>
      </section>
      {{else}}
      <section class="chat chat--empty">
        <p class="chat__placeholder">Выберите чат.</p>
      </section>
      {{/if}}
    </main>
  `;

  protected componentDidMount(): void {
    if (!this.chatsFetched) {
      this.chatsFetched = true;
      chatController.fetchChats();
    }
    this.bindChatList();
    this.bindCreateChat();
    this.bindActiveChatControls();
    this.bindMessageForm();
  }

  private bindChatList(): void {
    const el = this.element();
    if (!el) return;

    el.querySelectorAll<HTMLElement>('.chat-item').forEach((item) => {
      item.addEventListener('click', () => {
        const id = Number(item.dataset.chatId);
        if (Number.isFinite(id)) {
          chatController.selectChat(id);
        }
      });
    });
  }

  private bindCreateChat(): void {
    const btn = this.refs['createChatBtn'] as HTMLElement | undefined;
    btn?.addEventListener('click', () => {
      // TODO: replace window.prompt with a proper modal component for chat title input
      const title = window.prompt('Название чата');
      if (title && title.trim()) {
        chatController.createChat(title.trim());
      }
    });
  }

  private bindActiveChatControls(): void {
    const activeChat = this.props.activeChat;
    if (!activeChat) return;

    const addBtn = this.refs['addUserBtn'] as HTMLElement | undefined;
    const removeBtn = this.refs['removeUserBtn'] as HTMLElement | undefined;
    const deleteBtn = this.refs['deleteChatBtn'] as HTMLElement | undefined;

    addBtn?.addEventListener('click', () => {
      const login = window.prompt('Логин пользователя для добавления');
      if (login && login.trim()) {
        chatController.addUserByLogin(login.trim(), activeChat.id);
      }
    });

    removeBtn?.addEventListener('click', () => {
      const login = window.prompt('Логин пользователя для удаления');
      if (login && login.trim()) {
        chatController.removeUserByLogin(login.trim(), activeChat.id);
      }
    });

    deleteBtn?.addEventListener('click', () => {
      if (window.confirm(`Удалить чат "${activeChat.title}"?`)) {
        chatController.deleteChat(activeChat.id);
      }
    });
  }

  private bindMessageForm(): void {
    const form = this.refs['messageForm'] as HTMLFormElement | undefined;
    form?.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = form.elements.namedItem('message') as HTMLInputElement | null;
      if (!input || !input.value.trim()) return;
      // TODO: send the message through the websocket transport once it is implemented
      console.warn('Message sending is not implemented yet:', input.value);
      input.value = '';
    });
  }
}

function buildChatItem(chat: ChatDTO, activeId: number | null): ChatListItemView {
  return {
    id: chat.id,
    title: chat.title,
    letter: chat.title?.charAt(0)?.toUpperCase() || '?',
    avatarUrl: buildAvatarUrl(chat.avatar),
    hasAvatar: Boolean(chat.avatar),
    lastMessage: chat.last_message?.content ?? 'Пока нет сообщений',
    unreadCount: chat.unread_count ?? 0,
    isActive: activeId === chat.id,
  };
}

function buildActiveChat(chat: ChatDTO | null): ActiveChatView | null {
  if (!chat) return null;
  return {
    id: chat.id,
    title: chat.title,
    letter: chat.title?.charAt(0)?.toUpperCase() || '?',
    avatarUrl: buildAvatarUrl(chat.avatar),
  };
}

function buildActiveUserView(user: ChatUserDTO) {
  const fullName = [user.first_name, user.second_name].filter(Boolean).join(' ');
  const viewName = user.display_name || fullName || user.login;
  const letterSource = user.display_name || user.first_name || user.login || '?';
  return {
    id: user.id,
    viewName,
    letter: letterSource.charAt(0).toUpperCase(),
    avatarUrl: buildAvatarUrl(user.avatar),
    isAdmin: user.role === 'admin',
  };
}

function buildAvatarUrl(avatar: string | null | undefined): string {
  if (!avatar) return '';
  return `${RESOURCES_BASE_URL}/${avatar.replace(/^\/+/, '')}`;
}

function mapStateToProps(state: Indexed): Indexed {
  const chats = state.chats as Indexed | undefined;
  const list = (chats?.list as ChatDTO[] | undefined) ?? [];
  const activeId = (chats?.activeId as number | null | undefined) ?? null;
  const activeUsers = (chats?.activeUsers as ChatUserDTO[] | undefined) ?? [];
  const error = (chats?.error as string | null | undefined) ?? null;
  const activeChat = list.find((c) => c.id === activeId) ?? null;
  const activeUserViews = activeUsers.map(buildActiveUserView);

  return {
    chatItems: list.map((chat) => buildChatItem(chat, activeId)),
    activeChat: buildActiveChat(activeChat),
    activeUsers: activeUserViews,
    activeUsersCountText: activeUserViews.length
      // TODO pluralize
      ? `${activeUserViews.length} чела: ${activeUserViews.map((u) => u.viewName).join(', ')}`
      : '',
    chatsError: error,
  };
}

const ConnectedMessengerPage = connect(mapStateToProps)(MessengerPage);

export { ConnectedMessengerPage as ChatListPage };
