import {
  Link,
  Form,
  useActionData,
  redirect,
  useNavigation,
  useLoaderData,
} from "react-router-dom";
import Input from "./Input";
import { loginValidation } from "../utils/validations";
import axios from "axios";
import { useEffect } from "react";

export const loader = async ({ request }) => {
  return new URL(request.url).searchParams.get("message");
};

export const action = async ({ request }) => {
  const data = await request.formData();
  let ValidationErrors = loginValidation(data);

  const pathname = new URL(request.url).searchParams.get("redirectTo") || "/";

  if (Object.keys(ValidationErrors).length === 0) {
    // register backend request goes here
    try {
      const res = await axios.post("/login", {
        username: data.get("username"),
        email: data.get("email"),
        password: data.get("password"),
      });

      return redirect(`${pathname}?message=User logged in successfully`);
    } catch (error) {
      return { retrunedRes: error.response.data.error };
    }
  } else {
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
  const navigation = useNavigation();
  const message = useLoaderData();

  useEffect(() => {
    console.log("message:", message);
  }, [message]);

  return (
    <div className="bg-blue-50 h-screen flex items-center justify-center flex-col">
      <h4 className="text-4xl text-center my-4 font-bold">Login</h4>

      <p className="text-red-600 text-lg">
        {(errorMessage && errorMessage.retrunedRes) || message}
      </p>

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
          disabled={navigation.state === "submitting"}
        >
          {navigation.state === "submitting" ? "Logging in ..." : "Login"}
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
          <Link to="/recovery-email-send" className="text-red-500 pl-1">
            Forget password?
          </Link>
        </div>
      </Form>
    </div>
  );
}
