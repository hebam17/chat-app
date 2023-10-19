// validate password

export const validation = (data) => {
  const errors = {};

  const specialCharsRegexp = /[`!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/;
  const emailRegexp = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g;

  for (let [key, value] of data) {
    if (!value.trim()) {
      errors[key] = `${key} required!`;
    } else if (value.trim().includes(" ")) {
      errors[key] = `You can't have a space in ${key}`;
    } else if (key === "email" && !emailRegexp.test(value)) {
      errors[key] = "This email format is not supported!";
    } else if (key === "username" && specialCharsRegexp.test(value)) {
      errors[key] = "No special characters allowed";
    }
  }

  if (data.get("password") !== data.get("confirmPassword")) {
    errors["confirmPassword"] = "Password and confirm password should match!";
  }
  return errors;
};

export const loginValidation = (data) => {
  const errors = {};

  const specialCharsRegexp = /[`!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/;

  for (let [key, value] of data) {
    if (!value.trim()) {
      errors[key] = `${key} required!`;
    } else if (value.trim().includes(" ")) {
      errors[key] = `You can't have a space in ${key}`;
    } else if (key === "username" && specialCharsRegexp.test(value)) {
      errors[key] = "No special characters allowed";
    }
  }

  return errors;
};
