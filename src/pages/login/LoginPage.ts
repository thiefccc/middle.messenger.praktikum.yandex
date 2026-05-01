import { Block } from '../../framework/Block';
import { connect } from '../../framework/connect';
import { validateForm } from '../../utils/validation';
import authController from '../../controllers/AuthController';
import type { Indexed } from '../../types/indexed';
import './login.scss';

interface LoginPageProps {
  authError?: string | null;
}

class LoginPage extends Block<LoginPageProps> {
  static componentName = 'LoginPage';

  constructor(props: LoginPageProps = {}) {
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

          authController.login({
            login: data.login,
            password: data.password,
          });
        },
      },
    });
  }

  protected template = `
    <main class="page">
      <div class="form-card">
        <h1 class="form-card__title">Вход</h1>
        {{!-- TODO: show a success notification when the user has just been created on /sign-up --}}
        {{!-- TODO: add live validation that fires on every input event once the user has typed >= 8 characters --}}
        <form class="form-card__form" ref="form">
          <div class="form-card__field">
            <label class="form-card__label" for="login">Логин</label>
            {{{ Input type="text" name="login" placeholder="Введите логин" ref="login" }}}
          </div>
          <div class="form-card__field">
            <label class="form-card__label" for="password">Пароль</label>
            {{!-- TODO: add eye toggle to reveal/hide the password value --}}
            {{{ Input type="password" name="password" placeholder="Введите пароль" ref="password" }}}
          </div>
          {{#if authError}}
            <p class="form-card__error">{{authError}}</p>
          {{/if}}
          <div class="form-card__actions">
            {{{ Button label="Авторизоваться" type="submit" }}}
            {{{ Link label="Нет аккаунта?" page="/sign-up" }}}
          </div>
        </form>
      </div>
    </main>
  `;
}

function mapAuthErrorToProps(state: Indexed): Indexed {
  const auth = state.auth as Indexed | undefined;
  return { authError: auth?.error ?? null };
}

const ConnectedLoginPage = connect(mapAuthErrorToProps)(LoginPage);

export { ConnectedLoginPage as LoginPage };
