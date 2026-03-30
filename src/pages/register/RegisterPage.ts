import { Block } from '../../framework/Block';
import { validateForm } from '../../utils/validation';
import './register.scss';

export class RegisterPage extends Block {
  static componentName = 'RegisterPage';

  constructor() {
    super({
      events: {
        submit: (e: Event) => {
          e.preventDefault();
          const form = (e.target as HTMLElement).closest('form');
          if (!form) {
            return;
          }

          const data = validateForm(form);
          if (data) {
            console.log('Register form data:', data);
          }
        },
      },
    });
  }

  protected template = `
    <main class="page">
      <div class="form-card">
        <h1 class="form-card__title">Регистрация</h1>
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
          <div class="form-card__field">
            <label class="form-card__label" for="password">Пароль</label>
            {{{ Input type="password" name="password" placeholder="Введите пароль" ref="password" }}}
          </div>
          <div class="form-card__field">
            <label class="form-card__label" for="password_confirm">Пароль (ещё раз)</label>
            {{{ Input type="password" name="password_confirm" placeholder="Повторите пароль" ref="password_confirm" }}}
          </div>
          <div class="form-card__actions">
            {{{ Button label="Зарегистрироваться" type="submit" }}}
            {{{ Link label="Войти" page="login" }}}
          </div>
        </form>
      </div>
    </main>
  `;
}
