import axios from "axios";

// authenticate function
export const authenticate = async (username) => {
  try {
    return await axios.post("/authenticate", { username });
  } catch (error) {
    throw new Error(error.response.data.error);
  }
};

// getting user details
export const getUser = async () => {
  try {
    const { data } = await axios.get("/profile");
    return data;
  } catch (error) {
    throw new Error(error.response.data.error);
  }
};

// update user
export const updateUser = async (data) => {
  try {
    const token = localStorage.getItem("token");
    const { message } = await axios.put("/updateuser", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return message;
  } catch (error) {
    throw new Error(error.response.data.error);
  }
};

// generate OTP
export const generateOTP = async (email) => {
  try {
    const {
      data: { code, username },
      status,
    } = await axios.post("/generateOTP", { email });

    if (status === 201) {
      // send mail with the OTP
      let text = `Your password reset code is ${code}`;
      // await axios.post("/registerMail", {
      //   username,
      //   userEmail: email,
      //   text,
      //   subject: "Password reset code",
      // });
      return { code, username };
    }
  } catch (error) {
    console.log("error:", error);
    throw new Error(error.response.data.error);
  }
};

// verify OTP
export const verifyOTP = async ({ username, code }) => {
  try {
    const { data, status } = await axios.post("/verifyOTP", { username, code });
    return { data, status };
  } catch (error) {
    throw new Error(error.response?.data.error);
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
    throw new Error(error.response.data.error);
  }
};
