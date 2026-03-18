import "./profile.scss";
export { default as profileTemplate } from "./profile.hbs?raw";

export function initProfileEditMode(): void {
  const form = document.getElementById("profile-form");
  const editBtn = document.getElementById("profile-edit-btn");
  if (!form || !editBtn) {
    return;
  }

  editBtn.addEventListener("click", () => {
    const isEditing = form.classList.toggle("profile__form--editing");

    if (isEditing) {
      editBtn.textContent = "Сохранить";
      return;
    }

    for (const field of form.querySelectorAll(".profile__field")) {
      const input = field.querySelector<HTMLInputElement>(".profile__field-input");
      const valueSpan = field.querySelector(".profile__field-value");
      if (input && valueSpan) {
        valueSpan.textContent = input.value;
      }
    }

    editBtn.textContent = "Изменить данные";
  });
}
