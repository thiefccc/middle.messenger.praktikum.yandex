import { Block } from '../../framework/Block';
import type { ErrorData } from '../../types/error';
import './error.scss';

export class ErrorPage extends Block<ErrorData> {
  static componentName = 'ErrorPage';

  constructor() {
    const isServerError = window.location.pathname === '/500';
    super({
      code: isServerError ? '500' : '404',
      message: isServerError ? 'Уже фиским' : 'Не туда',
    });
  }

  protected template = `
    <main class="page">
      <section class="error-page">
        <h1 class="error-page__code">{{code}}</h1>
        <p class="error-page__message">{{message}}</p>
        <div class="error-page__actions">
          <button class="error-page__back" type="button" data-back>← Назад</button>
          {{{ Link label="К чатам" page="/messenger" }}}
        </div>
      </section>
    </main>
  `;
}
