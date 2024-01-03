// register validation
export const validation = (data) => {
  const errors = {};

  const specialCharsRegexp = /[`!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/;
  const emailRegexp = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
  const passwordRegexp = /[A-Z !@#$%.^&*()/><-]*\S{6,15}/;

  for (let [key, value] of data) {
    if (!value.trim()) {
      errors[key] = `${key} required!`;
    } else if (value.trim().includes(" ")) {
      errors[key] = `You can't have a space in ${key}`;
    } else if (key === "email" && !emailRegexp.test(value)) {
      errors[key] = "This email format is not supported!";
    } else if (key === "username" && specialCharsRegexp.test(value)) {
      errors[key] = "No special characters allowed";
    } else if ((key === "username" && value.length < 3) || value.length > 30) {
      errors[key] =
        "Username cannot be less than 3 or more than 30 characters long";
    } else if (key === "password" && !passwordRegexp.test(value)) {
      errors[key] =
        "password cannot be less than 6 or more than 15 charachters long";
    }
  }

  // password validation
  if (data.get("password") !== data.get("confirmPassword")) {
    errors["confirmPassword"] = "Password and confirm password should match!";
  }
  return errors;
};

// Login validation
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

// Reset password validation
export const ResetPasswordValidation = (data) => {
  const errors = {};
  if (data.get("password") !== data.get("confirmPassword")) {
    errors["confirmPassword"] = "Password and confirm password should match!";
  }
  return errors;
};
