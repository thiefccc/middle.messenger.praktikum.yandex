import { Block } from '../../framework/Block';
import { connect } from '../../framework/connect';
import { validateForm } from '../../utils/validation';
import authController from '../../controllers/AuthController';
import userController from '../../controllers/UserController';
import { RESOURCES_BASE_URL } from '../../api/constants';
import type { Indexed } from '../../types/indexed';
import type { UserDTO } from '../../api/types';
import './profile.scss';

interface SettingsPageProps {
  user?: UserDTO | null;
  editing?: boolean;
  changingPassword?: boolean;
  settingsError?: string | null;
}

class SettingsPage extends Block<SettingsPageProps> {
  static componentName = 'SettingsPage';

  constructor(props: SettingsPageProps = {}) {
    super(props);
  }

  protected template = `
    <main class="page">
      <section class="profile">
        <div class="profile__header">
          {{#if user.avatar}}
            <label class="avatar-lg avatar-lg--filled" ref="avatarLabel">
              <img class="avatar-lg__image" src="{{avatarUrl}}" alt="avatar" />
              <div class="avatar-lg__overlay">Загрузить</div>
              <input class="avatar-lg__input" type="file" name="avatar" accept="image/*" ref="avatarInput" />
            </label>
          {{else}}
            <label class="avatar-lg" ref="avatarLabel">
              <span>{{userInitial}}</span>
              <div class="avatar-lg__overlay">Загрузить</div>
              <input class="avatar-lg__input" type="file" name="avatar" accept="image/*" ref="avatarInput" />
            </label>
          {{/if}}
          <h1 class="profile__name">{{displayName}}</h1>
        </div>

        {{#if editing}}
        <form class="profile__form" ref="form">
          <ul class="profile__fields">
            <li class="profile__field">
              <span class="profile__field-label">Почта</span>
              {{{ Input type="email" name="email" value=user.email className="input profile__field-edit" }}}
            </li>
            <li class="profile__field">
              <span class="profile__field-label">Логин</span>
              {{{ Input type="text" name="login" value=user.login className="input profile__field-edit" }}}
            </li>
            <li class="profile__field">
              <span class="profile__field-label">Имя</span>
              {{{ Input type="text" name="first_name" value=user.first_name className="input profile__field-edit" }}}
            </li>
            <li class="profile__field">
              <span class="profile__field-label">Фамилия</span>
              {{{ Input type="text" name="second_name" value=user.second_name className="input profile__field-edit" }}}
            </li>
            <li class="profile__field">
              <span class="profile__field-label">Имя в чате</span>
              {{{ Input type="text" name="display_name" value=user.display_name className="input profile__field-edit" }}}
            </li>
            <li class="profile__field">
              <span class="profile__field-label">Телефон</span>
              {{{ Input type="tel" name="phone" value=user.phone className="input profile__field-edit" }}}
            </li>
          </ul>
          {{#if settingsError}}<p class="profile__error">{{settingsError}}</p>{{/if}}
          <div class="profile__actions">
            {{{ Button label="Сохранить" type="submit" className="button-secondary" ref="saveBtn" }}}
            {{{ Button label="Отмена" type="button" className="button-secondary" ref="cancelBtn" }}}
          </div>
        </form>
        {{else if changingPassword}}
        <form class="profile__form" ref="passwordForm">
          <ul class="profile__fields">
            <li class="profile__field">
              <span class="profile__field-label">Старый пароль</span>
              {{{ Input type="password" name="oldPassword" className="input profile__field-edit" }}}
            </li>
            <li class="profile__field">
              <span class="profile__field-label">Новый пароль</span>
              {{{ Input type="password" name="password" className="input profile__field-edit" }}}
            </li>
            <li class="profile__field">
              <span class="profile__field-label">Повторите новый пароль</span>
              {{{ Input type="password" name="password_confirm" className="input profile__field-edit" }}}
            </li>
          </ul>
          {{#if settingsError}}<p class="profile__error">{{settingsError}}</p>{{/if}}
          <div class="profile__actions">
            {{{ Button label="Сохранить" type="submit" className="button-secondary" ref="savePasswordBtn" }}}
            {{{ Button label="Отмена" type="button" className="button-secondary" ref="cancelPasswordBtn" }}}
          </div>
        </form>
        {{else}}
        <ul class="profile__fields">
          <li class="profile__field">
            <span class="profile__field-label">Почта</span>
            <span class="profile__field-value">{{user.email}}</span>
          </li>
          <li class="profile__field">
            <span class="profile__field-label">Логин</span>
            <span class="profile__field-value">{{user.login}}</span>
          </li>
          <li class="profile__field">
            <span class="profile__field-label">Имя</span>
            <span class="profile__field-value">{{user.first_name}}</span>
          </li>
          <li class="profile__field">
            <span class="profile__field-label">Фамилия</span>
            <span class="profile__field-value">{{user.second_name}}</span>
          </li>
          <li class="profile__field">
            <span class="profile__field-label">Имя в чате</span>
            <span class="profile__field-value">{{displayName}}</span>
          </li>
          <li class="profile__field">
            <span class="profile__field-label">Телефон</span>
            <span class="profile__field-value">{{user.phone}}</span>
          </li>
        </ul>
        <div class="profile__actions">
          {{{ Button label="Изменить данные" className="button-secondary" ref="editBtn" }}}
          {{{ Button label="Изменить пароль" className="button-secondary" ref="passwordBtn" }}}
          {{{ Button label="Выйти" className="button-danger" ref="logoutBtn" }}}
        </div>
        {{/if}}

        {{{ Link label="← Назад к чатам" page="/messenger" }}}
      </section>
    </main>
  `;

  protected componentDidMount(): void {
    if (this.props.editing) {
      this.bindEditMode();
    } else if (this.props.changingPassword) {
      this.bindPasswordMode();
    } else {
      this.bindViewMode();
    }
    this.bindAvatarUpload();
  }

  private bindAvatarUpload(): void {
    const input = this.refs['avatarInput'] as HTMLInputElement | undefined;
    if (!input) return;
    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (file) {
        userController.updateAvatar(file);
      }
    });
  }

  private bindViewMode(): void {
    const editBtn = this.refs['editBtn'] as HTMLElement | undefined;
    const passwordBtn = this.refs['passwordBtn'] as HTMLElement | undefined;
    const logoutBtn = this.refs['logoutBtn'] as HTMLElement | undefined;

    editBtn?.addEventListener('click', () => this.setProps({ editing: true }));
    passwordBtn?.addEventListener('click', () => this.setProps({ changingPassword: true }));
    logoutBtn?.addEventListener('click', () => authController.logout());
  }

  private bindEditMode(): void {
    const form = this.refs['form'] as HTMLFormElement | undefined;
    const cancelBtn = this.refs['cancelBtn'] as HTMLElement | undefined;
    if (!form) return;

    cancelBtn?.addEventListener('click', () => this.setProps({ editing: false }));

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = validateForm(form);
      if (!data) return;

      const ok = await userController.updateProfile({
        first_name: data.first_name,
        second_name: data.second_name,
        display_name: data.display_name,
        login: data.login,
        email: data.email,
        phone: data.phone,
      });
      if (ok) {
        this.setProps({ editing: false });
      }
    });
  }

  private bindPasswordMode(): void {
    const form = this.refs['passwordForm'] as HTMLFormElement | undefined;
    const cancelBtn = this.refs['cancelPasswordBtn'] as HTMLElement | undefined;
    if (!form) return;

    cancelBtn?.addEventListener('click', () => this.setProps({ changingPassword: false }));

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = validateForm(form);
      if (!data) return;
      if (data.password !== data.password_confirm) return;

      const ok = await userController.updatePassword({
        oldPassword: data.oldPassword,
        newPassword: data.password,
      });
      if (ok) {
        this.setProps({ changingPassword: false });
      }
    });
  }
}

function mapStateToProps(state: Indexed): Indexed {
  const user = (state.user as UserDTO | null) ?? null;
  const settings = state.settings as Indexed | undefined;

  const displayName = user?.display_name || `${user?.first_name ?? ''} ${user?.second_name ?? ''}`.trim();
  const userInitial = user?.first_name?.charAt(0) || '?';
  const avatarUrl = user?.avatar ? `${RESOURCES_BASE_URL}${user.avatar}` : '';

  return {
    user,
    displayName,
    userInitial,
    avatarUrl,
    settingsError: settings?.error ?? null,
  };
}

const ConnectedSettingsPage = connect(mapStateToProps)(SettingsPage);

export { ConnectedSettingsPage as ProfilePage };
