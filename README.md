# TaPresSlide Messenger

Веб-мессенджер — учебный проект (SPA) на TypeScript + Handlebars.

Целевая концепция: эксперементальный мессенджер на тапах и свайпах сконцентрированных в правом нижнем углу для ведущего пальца. Киллер (в прямом смысле, потому что это больше концепт, чем рабочая идея) фича - бесконечный канвас с историей бесед/контактов, по которому нужно слайдить зажатим пальцем, чтобы добраться до беседы.

## Netlify

Проект развёрнут: [https://resilient-monstera-55c5ab.netlify.app/](https://resilient-monstera-55c5ab.netlify.app/)

### Страницы
**⚠️ Important Note:** Это экраны заглушки, чтобы были - чуть-чуть опаздываю с ревью первого спринта. Потом доделаю экраны согласно папке UI

- [Авторизация](https://resilient-monstera-55c5ab.netlify.app/#login) — форма входа (логин, пароль). Стартовый экран.
- [Регистрация](https://resilient-monstera-55c5ab.netlify.app/#register) — форма регистрации (почта, логин, имя, фамилия, телефон, пароль, подтверждение пароля).
- [404](https://resilient-monstera-55c5ab.netlify.app/#error404) — страница «не найдено».
- [500](https://resilient-monstera-55c5ab.netlify.app/#error500) — страница серверной ошибки.
- [Список чатов](https://resilient-monstera-55c5ab.netlify.app/#chat-list) — перечень доступных чатов с аватаром, именем и последним сообщением.
- [Переписка](https://resilient-monstera-55c5ab.netlify.app/#chat) — экран чата с сообщениями и полем ввода.
- [Профиль](https://resilient-monstera-55c5ab.netlify.app/#profile) — просмотр данных пользователя, возможность загрузки аватара.

## Стек

- TypeScript 5+
- Vite
- Handlebars
- SCSS (БЭМ)
- ESLint + Stylelint
- Netlify (деплой)

## Установка

```bash
npm install
```

## Команды

- `npm run start` — сборка и запуск проекта (порт 3000)
- `npm run dev` — запуск dev-сервера c HBS (порт 3000)
- `npm run preview` — запуск просмотра (но лучше dev - HBS есть)
- `npm run build` — сборка в `dist/`
- `npm run lint` — проверка TS/JS кода (ESLint)
- `npm run lint:fix` — автоисправление ESLint
- `npm run lint:styles` — проверка SCSS (Stylelint)
- `npm run lint:styles:fix` — автоисправление Stylelint

## Прототипы

Описания прототипов экранов находятся в папке `ui/`.
