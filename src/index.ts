import Handlebars from "handlebars";
import "./styles/main.scss";

import "./components/button";
import "./components/input";
import "./components/avatar";
import "./components/link";

import { loginTemplate } from "./pages/login";
import { registerTemplate } from "./pages/register";
import { error404Template } from "./pages/error404";
import { error500Template } from "./pages/error500";
import { chatListTemplate } from "./pages/chat-list";
import { chatTemplate } from "./pages/chat";
import { profileTemplate, initProfileEditMode } from "./pages/profile";

Handlebars.registerHelper("firstLetter", (str: string) => {
  return str ? str.charAt(0).toUpperCase() : "?";
});

const pages: Record<string, { template: string; context: Record<string, unknown> }> = {
  login: {
    template: loginTemplate,
    context: {},
  },
  register: {
    template: registerTemplate,
    context: {},
  },
  error404: {
    template: error404Template,
    context: {},
  },
  error500: {
    template: error500Template,
    context: {},
  },
  "chat-list": {
    template: chatListTemplate,
    context: {
      chats: [
        { id: 1, name: "Андрей", avatar: "", lastMessage: "Привет! Как дела?", time: "10:30" },
        { id: 2, name: "Мария", avatar: "", lastMessage: "Увидимся завтра", time: "09:15" },
        { id: 3, name: "Рабочий чат", avatar: "", lastMessage: "Задача выполнена", time: "Вчера" },
        { id: 4, name: "Елена", avatar: "", lastMessage: "Спасибо большое!", time: "Пн" },
      ],
    },
  },
  chat: {
    template: chatTemplate,
    context: {
      chatName: "Андрей",
      messages: [
        { text: "Привет!", incoming: true, time: "10:25" },
        { text: "Привет! Как дела?", incoming: false, time: "10:26" },
        { text: "Отлично, спасибо! А у тебя?", incoming: true, time: "10:27" },
        { text: "Тоже хорошо. Что нового?", incoming: false, time: "10:28" },
        { text: "Да вот, работаю над проектом мессенджера", incoming: true, time: "10:29" },
        { text: "О, звучит интересно!", incoming: false, time: "10:30" },
      ],
    },
  },
  profile: {
    template: profileTemplate,
    context: {
      email: "user@example.com",
      login: "ivan_ivanov",
      firstName: "Иван",
      lastName: "Иванов",
      displayName: "Иван",
      phone: "+7 (999) 123-45-67",
    },
  },
};

function navigate(page: string): void {
  const root = document.getElementById("app");
  if (!root) {
    return;
  }

  const pageData = pages[page];
  if (!pageData) {
    navigate("error404");
    return;
  }

  window.location.hash = page;

  const compiled = Handlebars.compile(pageData.template);
  root.innerHTML = compiled(pageData.context);

  root.querySelectorAll("[data-page]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = (e.currentTarget as HTMLElement).dataset.page;
      if (target) navigate(target);
    });
  });

  if (page === "profile") {
    initProfileEditMode();
  }
}

function getPageFromHash(): string {
  const hash = window.location.hash.slice(1);
  return hash && pages[hash] ? hash : "login";
}

document.addEventListener("DOMContentLoaded", () => {
  navigate(getPageFromHash());
});

window.addEventListener("hashchange", () => {
  navigate(getPageFromHash());
});
