import { useRef } from "react";
import { Form, Link, useActionData, useNavigation } from "react-router-dom";
import { validation } from "../utils/validations";
import Input from "./Input";

export const action = async ({ request }) => {
  const data = await request.formData();
  let ValidationErrors = validation(data);
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
  console.log(errorMessage);
  const userRef = useRef();
  const navigation = useNavigation();

  return (
    <div className="container">
      <div className="flex px-6 justify-center flex-col align-center">
        <h4 className="text-4xl text-center my-3 font-bold">
          Welcome to CHAT APP
        </h4>

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
