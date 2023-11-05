import axios from "axios";

// authenticate function
export const authenticate = async (username) => {
  try {
    return await axios.post("/authenticate", { username });
  } catch (error) {
    return { error: "Username doesn't exist!" };
  }
};

// getting user details
export const getUser = async ({ username }) => {
  try {
    const { data } = await axios.get(`/user/${username}`);
    return data;
  } catch (error) {
    return { error };
  }
};

// register user
export const registerUser = async (credentials) => {
  try {
    const {
      data: { message },
      status,
    } = await axios.post("/register", credentials);

    const { username, email } = credentials;

    if (status === 201) {
      await axios.post("/registerMail", {
        username,
        userEmail: email,
        text: message,
      });
    }

    return message;
  } catch (error) {
    throw new Error(error.message);
  }
};

// login user
export const loginUser = async ({ username, password }) => {
  try {
    if (username && password) {
      const { data } = await axios.post("/login", { username, password });
      return data;
    }
    throw new Error("Please provide username and password");
  } catch (error) {
    throw new Error("Email or password dosn't match");
  }
};

// update user
export const updateUser = async (data) => {
  try {
    const token = await localStorage.getItem("token");
    const { message } = await axios.put("/updateuser", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return message;
  } catch (error) {
    throw new Error("couldn't update profile, please try again!");
  }
};

// generate OTP
export const generateOTP = async ({ username, email }) => {
  try {
    const {
      data: { code },
      status,
    } = await axios.post("/generateOTP", { username });

    if (status === 201) {
      // send mail with the OTP
      let text = `Your password reset code is ${code}`;
      await axios.post("/registerMail", {
        username,
        userEmail: email,
        text,
        subject: "Password reset code",
      });

      return code;
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

// verify OTP
export const verifyOTP = async ({ username, code }) => {
  try {
    const { data, status } = await axios.get("/verifyOTP", { username, code });
    return { data, status };
  } catch (error) {
    throw new Error(error.message);
  }
};

// reset password
export const resetPassword = async ({ username, password }) => {
  try {
    const { data, status } = await axios.put("/resetPassword", {
      username,
      password,
    });
    return { data, status };
  } catch (error) {
    throw new Error(error.message);
  }
};
