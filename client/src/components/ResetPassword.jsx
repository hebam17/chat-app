import { useEffect } from "react";
import { Form, useActionData } from "react-router-dom";
import Input from "./Input";
import { ResetPasswordValidation } from "../utils/validations";

export const action = async ({ request }) => {
  const data = await request.formData();
  let ValidationErrors = ResetPasswordValidation(data);
  if (Object.keys(ValidationErrors).length === 0) {
    console.log("empty");
    // register backend request goes here
    return { ValidationErrors };
  } else {
    console.log("errors occurs!");

    return { ValidationErrors };
  }
};

const inputs = [
  {
    id: "password",
    type: "password",
    inputName: "password",
    placeholder: "Enter the new password",
    inputLabel: "Password",
  },
  {
    id: "confirmPassword",
    type: "password",
    inputName: "confirmPassword",
    placeholder: "Repeat the new password",
    inputLabel: "Confirm Password",
  },
];

export default function ResetPassword() {
  const errorMessage = useActionData();

  useEffect(() => {
    console.log(errorMessage);
  }, [errorMessage]);

  return (
    <main className="flex flex-col justify-center items-center h-screen">
      <h1 className="text-4xl my-3">Reset password</h1>
      <h2 className="text-1xl">Enter the new password </h2>

      <Form method="post">
        <div className="flex flex-col justify-center items-center">
          <div className="flex flex-col justify-center items-left mt-3">
            {inputs.map((inputData) => (
              <Input
                {...inputData}
                key={inputData.id}
                errorMessage={errorMessage && errorMessage.ValidationErrors}
              />
            ))}
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-gray-800 font-semibold border border-gray-500 rounded-md"
          >
            Reset
          </button>
        </div>
      </Form>
    </main>
  );
}
