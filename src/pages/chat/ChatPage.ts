import { Block } from '../../framework/Block';
import { validateForm } from '../../utils/validation';
import { formatTime } from '../../utils/formatTime';
import type { MessageData } from '../../types/message';
import './chat.scss';
import './message.scss';

interface ChatPageProps {
  chatName: string;
  messages: MessageData[];
}

export class ChatPage extends Block<ChatPageProps> {
  static componentName = 'ChatPage';

  constructor(props: ChatPageProps) {
    super({
      ...props,
      events: {
        submit: (e: Event) => {
          e.preventDefault();
          const form = (e.target as HTMLElement).closest('form');
          if (!form) {
            return;
          }

          const data = validateForm(form);
          if (!data) {
            return;
          }

          console.log('Chat message:', data);

          const messagesContainer = this.refs['messages'];
          if (messagesContainer && data.message) {
            this.appendMessage(messagesContainer, data.message);
            form.reset();
          }
        },
      },
    });
  }

  protected template = `
    <main class="chat-page">
      <section class="chat">
        <header class="chat__header">
          <button class="chat__back" type="button" data-page="chat-list">← Назад</button>
          <h1 class="chat__name">{{chatName}}</h1>
        </header>
        <section class="chat__messages" ref="messages">
          {{#each messages}}
          <div class="message {{#if incoming}}message-incoming{{else}}message-outgoing{{/if}}">
            <p class="message__text">{{text}}</p>
            <time class="message__time">{{time}}</time>
          </div>
          {{/each}}
        </section>
        <footer class="chat__footer">
          <form class="chat__form" ref="chatForm">
            <input class="input-chat" type="text" name="message" placeholder="Сообщение..." />
            <button class="button-send" type="submit">Отправить</button>
          </form>
        </footer>
      </section>
    </main>
  `;

  private appendMessage(container: Element, text: string): void {
    const time = formatTime(new Date());

    const messageEl = document.createElement('div');
    messageEl.className = 'message message-outgoing';

    const textEl = document.createElement('p');
    textEl.className = 'message__text';
    textEl.textContent = text;

    const timeEl = document.createElement('time');
    timeEl.className = 'message__time';
    timeEl.textContent = time;

    messageEl.appendChild(textEl);
    messageEl.appendChild(timeEl);
    container.appendChild(messageEl);

    container.scrollTop = container.scrollHeight;
  }
}
