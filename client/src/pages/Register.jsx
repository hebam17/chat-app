import { useEffect, useRef } from "react";
import {
  Form,
  Link,
  redirect,
  useActionData,
  useNavigation,
} from "react-router-dom";
import { validation } from "../utils/validations";
import Input from "../components/Input";
import axios from "axios";
import DisplayError from "../components/DisplayError";

export const action = async ({ request }) => {
  const data = await request.formData();
  let ValidationErrors = validation(data);
  if (Object.keys(ValidationErrors).length === 0) {
    // register backend request goes here

    try {
      const res = await axios.post("/register", {
        username: data.get("username"),
        email: data.get("email"),
        password: data.get("password"),
        profile: "",
      });

      console.log("res:", res);

      return redirect(
        "/login?message=User was registerd successfully,now login please!"
      );
    } catch (err) {
      let error = err.response?.data?.error;
      if (Array.isArray(error)) {
        let errorObj = {};
        Object.assign(errorObj, ...error);
        return { ValidationErrors: errorObj };
      }
      return { retrunedRes: error };
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
    id: "email",
    type: "email",
    inputName: "email",
    placeholder: "Enter your email",
    inputLabel: "Email",
  },
  {
    id: "password",
    type: "password",
    inputName: "password",
    placeholder: "Enter your password",
    inputLabel: "Password",
  },
  {
    id: "confirmPassword",
    type: "password",
    inputName: "confirmPassword",
    placeholder: "Write your password again",
    inputLabel: "Confirm Password",
  },
];

export default function Register() {
  const errorMessage = useActionData();
  const userRef = useRef();
  const navigation = useNavigation();

  useEffect(() => {
    console.log(errorMessage);
  }, [errorMessage]);

  return (
    <div className="container">
      <div className="flex px-6 justify-center flex-col items-center">
        <h1 className="text-4xl text-center my-3 font-bold">
          Welcome to CHAT APP
        </h1>

        <DisplayError error={errorMessage && errorMessage.retrunedRes} />

        <Form method="post" ref={userRef} className="py-4" replace>
          <div className="profile py-2">
            {inputs.map((inputData) => (
              <Input
                {...inputData}
                key={inputData.id}
                errorMessage={errorMessage && errorMessage.ValidationErrors}
              />
            ))}

            <button
              type="submit"
              className="border border-gray-500 w-full p-2 text-xl text-gray-500 rounded-md mt-4"
              disabled={navigation.state === "submitting"}
            >
              {navigation.state === "submitting" ? "Submitting ..." : "Submit"}
            </button>
          </div>

          <div className="text-center py-4">
            <span className="text-gray-500">
              Already have an account?
              <Link to="/login" className="text-red-500 pl-1">
                Login Now
              </Link>
            </span>
          </div>
        </Form>
      </div>
    </div>
  );
}
