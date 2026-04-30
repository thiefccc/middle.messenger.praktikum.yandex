type ValidationRule = {
  pattern: RegExp;
  errorMessage: string;
};

const NAME_PATTERN = /^[A-ZА-ЯЁ][a-zA-Zа-яёА-ЯЁ-]*$/;
const NAME_ERROR = 'Латиница или кириллица, первая буква заглавная, без пробелов и цифр';

const PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*\d).{8,40}$/;
const PASSWORD_ERROR = '8–40 символов, минимум одна заглавная буква и одна цифра';

const rules: Record<string, ValidationRule> = {
  first_name: {
    pattern: NAME_PATTERN,
    errorMessage: NAME_ERROR,
  },
  second_name: {
    pattern: NAME_PATTERN,
    errorMessage: NAME_ERROR,
  },
  display_name: {
    pattern: NAME_PATTERN,
    errorMessage: NAME_ERROR,
  },
  login: {
    pattern: /^(?![\d]+$)[a-zA-Z\d_-]{3,20}$/,
    errorMessage: '3–20 символов, латиница, может содержать цифры, дефис, подчёркивание',
  },
  email: {
    pattern: /^[a-zA-Z\d._%+-]+@[a-zA-Z]+\.[a-zA-Z]{2,}$/,
    errorMessage: 'Некорректный email',
  },
  password: {
    pattern: PASSWORD_PATTERN,
    errorMessage: PASSWORD_ERROR,
  },
  password_confirm: {
    pattern: PASSWORD_PATTERN,
    errorMessage: PASSWORD_ERROR,
  },
  phone: {
    pattern: /^\+?\d{10,15}$/,
    errorMessage: '10–15 цифр, может начинаться с плюса',
  },
  message: {
    pattern: /^.+$/s,
    errorMessage: 'Сообщение не должно быть пустым',
  },
};

export function validate(name: string, value: string): string | null {
  const rule = rules[name];
  if (!rule || rule.pattern.test(value)) {
    return null;
  }

  return rule.errorMessage;
}

export function validateForm(form: HTMLFormElement): Record<string, string> | null {
  const formData = new FormData(form);
  const data: Record<string, string> = {};
  let hasErrors = false;

  for (const [name, value] of formData.entries()) {
    const strValue = String(value);
    data[name] = strValue;

    const error = validate(name, strValue);
    const input = form.querySelector<HTMLInputElement>(`[name="${name}"]`);
    const formField = input?.closest('.form-field');
    const errorElelment = formField?.querySelector('.validation-error');

    if (error) {
      hasErrors = true;
      input?.classList.add('input--error');
      if (errorElelment) {
        errorElelment.textContent = error;
        errorElelment.classList.add('validation-error--visible');
      }
    } else {
      input?.classList.remove('input--error');
      if (errorElelment) {
        errorElelment.textContent = '';
        errorElelment.classList.remove('validation-error--visible');
      }
    }
  }

  if (hasErrors) {
    return null;
  }

  return data;
}
