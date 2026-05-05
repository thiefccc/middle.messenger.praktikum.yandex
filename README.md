# TaPresSlide Messenger

Веб-мессенджер — учебный проект (SPA) на TypeScript + Handlebars.

Целевая концепция: экспериментальный мессенджер на тапах и свайпах, сконцентрированных в правом нижнем углу для ведущего пальца. Киллер-фича — бесконечный канвас с историей бесед/контактов, по которому нужно слайдить зажатым пальцем, чтобы добраться до беседы.

## Netlify

Проект развёрнут: [https://resilient-monstera-55c5ab.netlify.app/](https://resilient-monstera-55c5ab.netlify.app/)

### ⚠️ ВАЖНО: ограничение по браузеру при проверке production-сборки

API Praktikum (`https://ya-praktikum.tech`) выдаёт авторизационную куку с атрибутами
`Domain=ya-praktikum.tech; HttpOnly; Secure; SameSite=None`. Production-сборка ходит на этот
API напрямую с домена `*.netlify.app`, поэтому в браузере это **third-party cookie**.

Современные **Chromium-браузеры (Chrome / Edge / Brave) начиная с версии ~143 по
умолчанию режут такие cookies политикой Tracking Protection** (Privacy Sandbox). На запросах
видны заголовки `sec-fetch-site: cross-site` и `sec-fetch-storage-access: none` — кука лежит
в `Application → Cookies → ya-praktikum.tech`, но в кросс-сайт запрос **не прицепляется**, и
сервер при `GET /auth/user` возвращает «не авторизован» и сбрасывает `authCookie`. Войти в
приложение в дефолтном Chrome 143+ **невозможно** без серверного прокси (Edge Function /
Functions), который переписывал бы `Set-Cookie: Domain` (это уже не статический деплой и
осознанно не делалось в рамках задания).

**Для проверки production-сборки используйте один из вариантов:**

- **Mozilla Firefox 139.0.x** — проверено, всё работает «из коробки» (third-party cookies
  по дефолту допускаются для сайтов без known-trackers списка).
- Любой Chromium с **Chrome ≤ 142** до глобального включения Tracking Protection.
- Любой Chromium-браузер, в котором вручную включены сторонние cookies для домена
  `[*.]ya-praktikum.tech`: `chrome://settings/cookies` → «Sites that can always use cookies»
  → Add → `[*.]ya-praktikum.tech` → Include third-party cookies on this site → Reload.

В **dev-режиме** (`npm run dev`) этой проблемы нет: vite-прокси переписывает домен куки на
`localhost` через `cookieDomainRewrite`, поэтому она становится first-party и работает в любом
актуальном браузере.

### Маршруты

- `/` — авторизация (логин, пароль).
- `/sign-up` — регистрация (почта, логин, имя, фамилия, телефон, пароль, подтверждение пароля).
- `/settings` — настройки профиля: просмотр данных, редактирование, смена пароля, загрузка аватара, выход.
- `/messenger` — мессенджер: список чатов слева, активный чат справа. Создание/удаление чатов, добавление и удаление пользователей в чате.
- `/404` — страница «не найдено» (отображается также для несуществующих маршрутов через fallback).
- `/500` — страница серверной ошибки.

Маршруты `/settings` и `/messenger` защищены авторизацией: при отсутствии сессии происходит редирект на `/`. Авторизованный пользователь, попадая на `/` или `/sign-up`, перенаправляется на `/messenger`.

## Стек

- TypeScript 5+ (strict mode, `tsc --noEmit`)
- Vite
- Handlebars (шаблонизатор)
- SCSS (БЭМ)
- ESLint + Stylelint + Prettier
- Netlify (деплой)

## Архитектура

Проект построен по паттерну MVC + Service/Controller:

- **View** — базовый класс `Block` и страницы/компоненты, наследующие от него. Шаблоны на Handlebars.
- **Router** — собственный SPA-роутер с поддержкой History API, guard'ом и fallback-маршрутом.
- **Store** — глобальный синглтон-стор с подпиской и иммутабельным `setState(path, value)`. Компоненты подключаются через HOC `connect(mapStateToProps)`, по курсу.
- **Service** — классы в `api/` (`AuthService`, `UserService`, `ChatService`), описывают запросы к серверу. Каждый сервис наследует `BaseAPI` и использует общий `HTTPTransport` (нейминг оставил привычный Service, вместо API)
- **Controller** — классы в `controllers/` (`AuthController`, `UserController`, `ChatController`), содержат бизнес-логику: вызывают сервисы, управляют состоянием стора, обрабатывают ошибки. Компоненты вызывают только контроллеры.

### Структура проекта

```
src/
├── api/                # BaseAPI, AuthService, UserService, ChatService, types
├── controllers/        # AuthController, UserController, ChatController
├── framework/          # Block, Router, Route, Store, connect, registerComponent
├── components/         # Button, Input, Link, Avatar, ValidationError
├── pages/              # LoginPage, RegisterPage, ProfilePage (settings),
│                       # ChatListPage (messenger), ChatPage, ErrorPage
├── styles/             # Общие стили, переменные, reset
├── types/              # Indexed, ChatItem, ProfileData, ErrorData, ...
├── utils/              # HTTPTransport, queryStringify, isEqual, merge, set,
│                       # cloneDeep, trim, typeChecks, validation, formatTime,
│                       # renderDOM
└── main.ts             # Точка входа
```

### Сервисы (BaseAPI)

Базовый класс `BaseAPI` содержит CRUD. Конкретные сервисы расширяют его и вызывают свой инстанс `HTTPTransport`, привязанный к подресурсу (TODO переделать по-чловечески из наследования на декомпозицию?):

- `AuthService` — `signIn`, `signUp`, `logout`, `getUser`.
- `UserService` — `updateProfile`, `updatePassword`, `updateAvatar`, `searchByLogin`, `getById`.
- `ChatService` — `list`, `create`, `deleteChat`, `addUsers`, `removeUsers`, `getToken`.

### Контроллеры

Контроллеры — единственные точки входа из View в API. Они:

- Вызывают сервисы.
- Складывают результат в `Store` (`store.setState('user', ...)`, `store.setState('chats.list', ...)` и т.д.).
- Извлекают `reason` из ошибок API и кладут в `auth.error`, `settings.error`, `chats.error`.
- При необходимости делают навигацию через `Router.go(...)`.

### Компонентный подход

- Все компоненты наследуют `Block` с типизированными props.
- Жизненный цикл: `componentDidMount`, `componentWillUnmount`.
- Обновление через `setProps()` — вызывает ререндер.
- Компоненты регистрируются как Handlebars-хелперы через `registerComponent`.
- HOC `connect(mapStateToProps)` подписывает компонент на стор и автоматически отписывается при размонтировании.

### Валидация форм

Единый механизм валидации для всех форм:

- Валидация на `blur` (встроена в компонент Input).
- Повторная проверка при `submit`.
- Правила: `first_name`, `second_name`, `display_name`, `login`, `email`, `password`, `phone`, `message`.
- Ошибки отображаются через компонент `ValidationError`.

## Установка

```bash
npm install
```

## Команды

- `npm run start` — сборка и запуск проекта (порт 3000)
- `npm run dev` — запуск dev-сервера
- `npm run build` — сборка в `dist/`
- `npm run lint` — полная проверка (TypeScript + ESLint + Stylelint)
- `npm run lint:ts` — проверка типов (`tsc --noEmit`)
- `npm run lint:eslint` — проверка JS/TS кода (ESLint)
- `npm run lint:eslint:fix` — автоисправление ESLint
- `npm run lint:styles` — проверка SCSS (Stylelint)
- `npm run lint:styles:fix` — автоисправление Stylelint
- `npm run format` — проверка форматирования (Prettier)
- `npm run format:fix` — автоисправление форматирования

## Прототипы

Описания прототипов экранов находятся в папке `ui/`.
