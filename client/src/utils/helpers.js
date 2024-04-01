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
export const logout = async (setWs, setId, setUsername) => {
  try {
    await axios.post("/logout");
    setWs(null);
    setId(null);
    setUsername(null);
  } catch (error) {
    console.log(error.response.data.error);
  }
};
