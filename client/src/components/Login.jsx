import { Link, Form, useActionData } from "react-router-dom";
import Input from "./Input";
import { loginValidation } from "../utils/validations";

export const action = async ({ request }) => {
  const data = await request.formData();
  let ValidationErrors = loginValidation(data);
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
    id: "username",
    type: "text",
    inputName: "username",
    placeholder: "Enter your username",
    inputLabel: "Username",
  },
  {
    id: "password",
    type: "password",
    inputName: "password",
    placeholder: "Enter your password",
    inputLabel: "Password",
  },
];

export default function Login() {
  const errorMessage = useActionData();

  return (
    <div className="bg-blue-50 h-screen flex items-center justify-center flex-col">
      <h4 className="text-4xl text-center my-4 font-bold">Login</h4>

      <Form method="post" className="w-full px-6 mb-12" replace>
        {inputs.map((inputData) => (
          <Input
            {...inputData}
            key={inputData.id}
            errorMessage={errorMessage && errorMessage.ValidationErrors}
          />
        ))}
        <button
          type="submit"
          className="bg-blue-500 text-white block w-full rounded-md p-2"
        >
          Register
        </button>

        <div className="text-center py-4">
          <span className="text-gray-500">
            Not a Member?
            <Link to="/register" className="text-red-500 pl-1">
              Register Now
            </Link>
          </span>
        </div>

        <div className="text-center py-4">
          <Link to="/recovery" className="text-red-500 pl-1">
            Forget password?
          </Link>
        </div>
      </Form>
    </div>
  );
}
