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
      <input
        type={type}
        name={inputName}
        id={id}
        className="w-full my-1 px-3 py-2 rounded-lg bg-sky-50 focus:outline-sky-500 focus:border-none lg:text-lg md:text-base text-sm font-semibold"
        autoComplete="off"
        {...others}
      />

      <p className="text-sm my-1 px-3 text-red-600">
        {errorMessage && errorMessage[inputName]}
      </p>
    </div>
  );
}
