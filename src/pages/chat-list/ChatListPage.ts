import { Block } from '../../framework/Block';
import type { ChatItem } from '../../types/chat';
import './chat-list.scss';

interface ChatListPageProps {
  chats: ChatItem[];
}

export class ChatListPage extends Block<ChatListPageProps> {
  static componentName = 'ChatListPage';

  protected template = `
    <main class="chat-list-page">
      <aside class="chat-list">
        <nav class="chat-list__header">
          <h1 class="chat-list__title">Чаты</h1>
          {{{ Link label="Профиль" page="profile" }}}
        </nav>
        <div class="chat-list__search">
          {{{ Input className="input-search" type="text" name="search" placeholder="Поиск" }}}
        </div>
        <ul class="chat-list__items">
          {{#each chats}}
          <li class="chat-item" data-page="chat">
            {{{ Avatar letter=(firstLetter name) }}}
            <div class="chat-item__info">
              <span class="chat-item__name">{{name}}</span>
              <span class="chat-item__message">{{lastMessage}}</span>
            </div>
            <time class="chat-item__time">{{time}}</time>
          </li>
          {{/each}}
        </ul>
      </aside>
    </main>
  `;
}
