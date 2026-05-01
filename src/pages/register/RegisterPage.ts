import { Block } from '../../framework/Block';
import { connect } from '../../framework/connect';
import { validateForm } from '../../utils/validation';
import authController from '../../controllers/AuthController';
import type { Indexed } from '../../types/indexed';
import './register.scss';

interface RegisterPageProps {
  authError?: string | null;
}

class RegisterPage extends Block<RegisterPageProps> {
  static componentName = 'RegisterPage';

  constructor(props: RegisterPageProps = {}) {
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

          if (data.password !== data.password_confirm) {
            return;
          }

          authController.register({
            first_name: data.first_name,
            second_name: data.second_name,
            login: data.login,
            email: data.email,
            password: data.password,
            phone: data.phone,
          });
        },
      },
    });
  }

  protected template = `
    <main class="page">
      <div class="form-card">
        <h1 class="form-card__title">Регистрация</h1>
        {{!-- TODO: persist field values on blur/navigation between inputs and rehydrate them on page reload --}}
        <form class="form-card__form" ref="form">
          <div class="form-card__field">
            <label class="form-card__label" for="email">Почта</label>
            {{{ Input type="email" name="email" placeholder="Введите почту" ref="email" }}}
          </div>
          <div class="form-card__field">
            <label class="form-card__label" for="login">Логин</label>
            {{{ Input type="text" name="login" placeholder="Введите логин" ref="login" }}}
          </div>
          <div class="form-card__field">
            <label class="form-card__label" for="first_name">Имя</label>
            {{{ Input type="text" name="first_name" placeholder="Введите имя" ref="first_name" }}}
          </div>
          <div class="form-card__field">
            <label class="form-card__label" for="second_name">Фамилия</label>
            {{{ Input type="text" name="second_name" placeholder="Введите фамилию" ref="second_name" }}}
          </div>
          <div class="form-card__field">
            <label class="form-card__label" for="phone">Телефон</label>
            {{{ Input type="tel" name="phone" placeholder="+7 (___) ___-__-__" ref="phone" }}}
          </div>
          {{!-- TODO: validate that "password" and "password_confirm" match and surface a field-level error --}}
          <div class="form-card__field">
            <label class="form-card__label" for="password">Пароль</label>
            {{{ Input type="password" name="password" placeholder="Введите пароль" ref="password" }}}
          </div>
          <div class="form-card__field">
            <label class="form-card__label" for="password_confirm">Пароль (ещё раз)</label>
            {{{ Input type="password" name="password_confirm" placeholder="Повторите пароль" ref="password_confirm" }}}
          </div>
          {{#if authError}}
            <p class="form-card__error">{{authError}}</p>
          {{/if}}
          <div class="form-card__actions">
            {{{ Button label="Зарегистрироваться" type="submit" }}}
            {{{ Link label="Войти" page="/" }}}
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

const ConnectedRegisterPage = connect(mapAuthErrorToProps)(RegisterPage);

export { ConnectedRegisterPage as RegisterPage };
