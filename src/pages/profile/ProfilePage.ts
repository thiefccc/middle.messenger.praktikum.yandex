import { Block } from '../../framework/Block';
import { validateForm } from '../../utils/validation';
import type { ProfileData } from '../../types/profile';
import './profile.scss';

export class ProfilePage extends Block<ProfileData> {
  static componentName = 'ProfilePage';

  protected template = `
    <main class="page">
      <section class="profile">
        <div class="profile__header">
          {{{ Avatar letter="👤" editable=true }}}
          <h1 class="profile__name">{{displayName}}</h1>
        </div>

        {{#if editing}}
        <form class="profile__form" ref="form">
          <ul class="profile__fields">
            <li class="profile__field">
              <span class="profile__field-label">Почта</span>
              {{{ Input type="email" name="email" value=email className="input profile__field-edit" }}}
            </li>
            <li class="profile__field">
              <span class="profile__field-label">Логин</span>
              {{{ Input type="text" name="login" value=login className="input profile__field-edit" }}}
            </li>
            <li class="profile__field">
              <span class="profile__field-label">Имя</span>
              {{{ Input type="text" name="first_name" value=firstName className="input profile__field-edit" }}}
            </li>
            <li class="profile__field">
              <span class="profile__field-label">Фамилия</span>
              {{{ Input type="text" name="second_name" value=lastName className="input profile__field-edit" }}}
            </li>
            <li class="profile__field">
              <span class="profile__field-label">Имя в чате</span>
              {{{ Input type="text" name="display_name" value=displayName className="input profile__field-edit" }}}
            </li>
            <li class="profile__field">
              <span class="profile__field-label">Телефон</span>
              {{{ Input type="tel" name="phone" value=phone className="input profile__field-edit" }}}
            </li>
          </ul>
          <div class="profile__actions">
            {{{ Button label="Сохранить" className="button-secondary" ref="saveBtn" }}}
          </div>
        </form>
        {{else}}
        <ul class="profile__fields">
          <li class="profile__field">
            <span class="profile__field-label">Почта</span>
            <span class="profile__field-value">{{email}}</span>
          </li>
          <li class="profile__field">
            <span class="profile__field-label">Логин</span>
            <span class="profile__field-value">{{login}}</span>
          </li>
          <li class="profile__field">
            <span class="profile__field-label">Имя</span>
            <span class="profile__field-value">{{firstName}}</span>
          </li>
          <li class="profile__field">
            <span class="profile__field-label">Фамилия</span>
            <span class="profile__field-value">{{lastName}}</span>
          </li>
          <li class="profile__field">
            <span class="profile__field-label">Имя в чате</span>
            <span class="profile__field-value">{{displayName}}</span>
          </li>
          <li class="profile__field">
            <span class="profile__field-label">Телефон</span>
            <span class="profile__field-value">{{phone}}</span>
          </li>
        </ul>
        <div class="profile__actions">
          {{{ Button label="Изменить данные" className="button-secondary" ref="editBtn" }}}
          {{{ Button label="Изменить пароль" className="button-secondary" }}}
          {{{ Button label="Выйти" className="button-danger" }}}
        </div>
        {{/if}}

        {{{ Link label="← Назад к чатам" page="chat-list" }}}
      </section>
    </main>
  `;

  componentDidMount(): void {
    if (this.props.editing) {
      this.initEditMode();
    } else {
      this.initViewMode();
    }
  }

  private initViewMode(): void {
    const editBtn = this.refs['editBtn'] as HTMLElement | undefined;
    if (!editBtn) {
      return;
    }

    editBtn.addEventListener('click', () => {
      this.setProps({ editing: true });
    });
  }

  private initEditMode(): void {
    const saveBtn = this.refs['saveBtn'] as HTMLElement | undefined;
    const form = this.refs['form'] as HTMLFormElement | undefined;
    if (!saveBtn || !form) {
      return;
    }

    saveBtn.addEventListener('click', () => {
      const data = validateForm(form);
      if (!data) {
        return;
      }

      console.log('Profile form data:', data);

      this.setProps({
        email: data.email ?? this.props.email,
        login: data.login ?? this.props.login,
        firstName: data.first_name ?? this.props.firstName,
        lastName: data.second_name ?? this.props.lastName,
        displayName: data.display_name ?? this.props.displayName,
        phone: data.phone ?? this.props.phone,
        editing: false,
      });
    });
  }
}
