import axios from "axios";

export const unique = (arr, by) => {
  let newArr = [];
  arr.forEach((elem) => {
    if (!newArr.find((newElem) => newElem[by] === elem[by]) || !(by in elem)) {
      newArr.push(elem);
    }
  });
  return newArr;
};

// log user out
export const logout = async (
  setWs,
  setId,
  setUsername,
  setAccessToken,
  setError = null
) => {
  try {
    await axios.post("/logout");
    setWs(null);
    setId(null);
    setUsername(null);
    setAccessToken(null);
  } catch (error) {
    setError
      ? setError(error.response.data.error)
      : console.log(error.response.data.error);
  }
};
