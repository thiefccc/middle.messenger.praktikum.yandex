import { Block } from '../../framework/Block';
import { validateForm } from '../../utils/validation';
import './login.scss';

export class LoginPage extends Block {
  static componentName = 'LoginPage';

  protected template = `
    <main class="page">
      <div class="form-card">
        <h1 class="form-card__title">Вход</h1>
        <form class="form-card__form" ref="form">
          <div class="form-card__field">
            <label class="form-card__label" for="login">Логин</label>
            {{{ Input type="text" name="login" placeholder="Введите логин" ref="login" }}}
          </div>
          <div class="form-card__field">
            <label class="form-card__label" for="password">Пароль</label>
            {{{ Input type="password" name="password" placeholder="Введите пароль" ref="password" }}}
          </div>
          <div class="form-card__actions">
            {{{ Button label="Авторизоваться" type="submit" }}}
            {{{ Link label="Нет аккаунта?" page="register" }}}
          </div>
        </form>
      </div>
    </main>
  `;

  protected events = {
    submit: (e: Event) => {
      e.preventDefault();
      const form = (e.target as HTMLElement).closest('form');
      if (!form) {
        return;
      }

      const data = validateForm(form);
      if (data) {
        console.log('Login form data:', data);
      }
    },
  };
}
