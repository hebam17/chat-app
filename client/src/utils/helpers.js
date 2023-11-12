import jwt_decode from "jwt-decode";

export const getUsername = async () => {
  const token = localStorage.getItem("token");
  if (!token) return Promise.reject("Make sure you are logged in");
  let decode = jwt_decode(token);
  console.log(decode);
};

getUsername();
