export const unique = (arr, by) => {
  let newArr = [];
  arr.forEach((elem) => {
    if (
      !newArr.find((newElem) => newElem[by] === elem[by]) ||
      !("id" in elem)
    ) {
      newArr.push(elem);
    }
  });
  return newArr;
};
