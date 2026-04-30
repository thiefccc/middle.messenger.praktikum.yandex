# TaPresSlide Messenger

Веб-мессенджер — учебный проект (SPA) на TypeScript + Handlebars.

Целевая концепция: экспериментальный мессенджер на тапах и свайпах, сконцентрированных в правом нижнем углу для ведущего пальца. Киллер-фича — бесконечный канвас с историей бесед/контактов, по которому нужно слайдить зажатым пальцем, чтобы добраться до беседы.

## Netlify

Проект развёрнут: [https://resilient-monstera-55c5ab.netlify.app/](https://resilient-monstera-55c5ab.netlify.app/)

### Страницы

- [Авторизация](https://resilient-monstera-55c5ab.netlify.app/#login) — форма входа (логин, пароль). Стартовый экран.
- [Регистрация](https://resilient-monstera-55c5ab.netlify.app/#register) — форма регистрации (почта, логин, имя, фамилия, телефон, пароль, подтверждение пароля).
- [404](https://resilient-monstera-55c5ab.netlify.app/#error404) — страница «не найдено».
- [500](https://resilient-monstera-55c5ab.netlify.app/#error500) — страница серверной ошибки.
- [Список чатов](https://resilient-monstera-55c5ab.netlify.app/#chat-list) — перечень доступных чатов с аватаром, именем и последним сообщением.
- [Переписка](https://resilient-monstera-55c5ab.netlify.app/#chat) — экран чата с сообщениями и полем ввода.
- [Профиль](https://resilient-monstera-55c5ab.netlify.app/#profile) — просмотр и редактирование данных пользователя, загрузка аватара.

## Стек

- TypeScript 5+ (strict mode, `tsc --noEmit`)
- Vite
- Handlebars (шаблонизатор)
- SCSS (БЭМ)
- ESLint + Stylelint + Prettier
- Netlify (деплой)

## Архитектура

Проект построен по паттерну MVC:

- **View** — базовый класс `Block` и наследующие от него страницы/компоненты. Генерация содержимого через Handlebars.
- **Controller** — `Router` (hash-навигация) управляет жизненным циклом страниц.
- **Model** — данные и сервисы (готово к подключению API).

### Структура проекта

```
src/
├── framework/          # Block, Router, registerComponent
├── components/         # Button, Input, Link, Avatar, ValidationError
├── pages/              # LoginPage, RegisterPage, ProfilePage, ChatPage, ChatListPage, ErrorPage
├── styles/             # Общие стили, переменные, reset
├── types/              # Интерфейсы: MessageData, ChatItem, ProfileData, ErrorData
├── utils/              # Валидация, форматирование
└── main.ts             # Точка входа
```

### Компонентный подход

- Все компоненты наследуют `Block` с типизированными props.
- Жизненный цикл: `componentDidMount`, `componentWillUnmount`.
- Обновление через `setProps()` — вызывает ререндер.
- Компоненты регистрируются как Handlebars-хелперы через `registerComponent`.

### Валидация форм

Единый механизм валидации для всех форм:
- Валидация на `blur` (встроена в компонент Input).
- Повторная проверка при `submit`.
- Правила: `first_name`, `second_name`, `login`, `email`, `password`, `phone`, `message`.
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
