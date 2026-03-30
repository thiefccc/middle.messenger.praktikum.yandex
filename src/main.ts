import Handlebars from 'handlebars';
import './styles/main.scss';

import { registerComponent } from './framework/registerComponent';
import { Router } from './framework/Router';

import { Button } from './components/button';
import { Input } from './components/input';
import { Link } from './components/link';
import { Avatar } from './components/avatar';
import { ValidationError } from './components/validation-error';

import { LoginPage } from './pages/login';
import { RegisterPage } from './pages/register';
import { ErrorPage } from './pages/error';
import { ChatListPage } from './pages/chat-list';
import { ChatPage } from './pages/chat';
import { ProfilePage } from './pages/profile';

Handlebars.registerHelper('firstLetter', (str: string) => {
  return str ? str.charAt(0).toUpperCase() : '?';
});

registerComponent(ValidationError);
registerComponent(Button);
registerComponent(Input);
registerComponent(Link);
registerComponent(Avatar);

const chatData = {
  chatName: 'Андрей',
  messages: [
    { text: 'Привет!', incoming: true, time: '10:25' },
    { text: 'Привет! Как дела?', incoming: false, time: '10:26' },
    { text: 'Отлично, спасибо! А у тебя?', incoming: true, time: '10:27' },
    { text: 'Тоже хорошо. Что нового?', incoming: false, time: '10:28' },
    { text: 'Да вот, работаю над проектом мессенджера', incoming: true, time: '10:29' },
    { text: 'О, звучит интересно!', incoming: false, time: '10:30' },
  ],
};

const chatListData = {
  chats: [
    { id: 1, name: 'Андрей', avatar: '', lastMessage: 'Привет! Как дела?', time: '10:30' },
    { id: 2, name: 'Мария', avatar: '', lastMessage: 'Увидимся завтра', time: '09:15' },
    { id: 3, name: 'Рабочий чат', avatar: '', lastMessage: 'Задача выполнена', time: 'Вчера' },
    { id: 4, name: 'Елена', avatar: '', lastMessage: 'Спасибо большое!', time: 'Пн' },
  ],
};

const profileData = {
  email: 'user@example.com',
  login: 'ivan_ivanov',
  firstName: 'Иван',
  lastName: 'Иванов',
  displayName: 'Иван',
  phone: '+79991234567',
};

const router = new Router('#app');

router
  .addRoute('login', { create: () => new LoginPage() })
  .addRoute('register', { create: () => new RegisterPage() })
  .addRoute('error404', { create: () => new ErrorPage({ code: '404', message: 'Не туда попали' }) })
  .addRoute('error500', { create: () => new ErrorPage({ code: '500', message: 'Мы уже фиксим' }) })
  .addRoute('chat-list', { create: () => new ChatListPage(chatListData) })
  .addRoute('chat', { create: () => new ChatPage(chatData) })
  .addRoute('profile', { create: () => new ProfilePage(profileData) })
  .start();
