import { useEffect } from "react";

export default function Input({
  id,
  type,
  inputName,
  inputLabel,
  errorMessage,
  ...others
}) {
  return (
    <div className="my-2">
      <label htmlFor={id}>{inputLabel}</label>
      <input
        type={type}
        name={inputName}
        id={id}
        className="w-full my-2 p-2 rounded-md border border-gray-200 focus:border-blue-300 focus:outline-none "
        placeholder="Enter your username"
        autoComplete="off"
        {...others}
      />

      <p className="text-sm my-1 text-red-500">
        {errorMessage && errorMessage[inputName]}
      </p>
    </div>
  );
}
