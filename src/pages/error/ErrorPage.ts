import { Block } from '../../framework/Block';
import type { ErrorData } from '../../types/error';
import './error.scss';

export class ErrorPage extends Block<ErrorData> {
  static componentName = 'ErrorPage';

  protected template = `
    <main class="page">
      <section class="error-page">
        <h1 class="error-page__code">{{code}}</h1>
        <p class="error-page__message">{{message}}</p>
<!--        TODO make page as a props with a link to a trigger page-->
        {{{ Link label="Назад к чатам" page="chat-list" }}}
      </section>
    </main>
  `;
}
