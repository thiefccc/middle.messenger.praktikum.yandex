import Handlebars from 'handlebars';
import './styles/main.scss';

import { Block } from './framework/Block';
import { registerComponent } from './framework/registerComponent';
import { Router } from './framework/Router';
import store from './framework/Store';
import authController from './controllers/AuthController';

import { Button } from './components/button';
import { Input } from './components/input';
import { Link } from './components/link';
import { Avatar } from './components/avatar';
import { ValidationError } from './components/validation-error';

import { LoginPage } from './pages/login';
import { RegisterPage } from './pages/register';
import { ErrorPage } from './pages/error';
import { ChatListPage } from './pages/chat-list';
import { ProfilePage } from './pages/profile';

Handlebars.registerHelper('firstLetter', (str: string) => {
  return str ? str.charAt(0).toUpperCase() : '?';
});

registerComponent(ValidationError);
registerComponent(Button);
registerComponent(Input);
registerComponent(Link);
registerComponent(Avatar);

const PUBLIC_PATHS = new Set(['/', '/sign-up', '/404', '/500']);

const router = new Router('#app');

router
  .use('/', LoginPage as unknown as new () => Block)
  .use('/sign-up', RegisterPage as unknown as new () => Block)
  .use('/settings', ProfilePage as unknown as new () => Block)
  .use('/messenger/:chatId?', ChatListPage as unknown as new () => Block)
  .use('/404', ErrorPage as unknown as new () => Block)
  .use('/500', ErrorPage as unknown as new () => Block)
  .setFallback('/404')
  .setGuard((pathname) => {
    const isAuthenticated = Boolean(store.getState().user);
    const isPublic = PUBLIC_PATHS.has(pathname);

    if (!isAuthenticated && !isPublic) {
      return '/';
    }
    if (isAuthenticated && (pathname === '/' || pathname === '/sign-up')) {
      return '/messenger';
    }
    return null;
  });

(async () => {
  await authController.fetchUser();
  router.start();
})();
