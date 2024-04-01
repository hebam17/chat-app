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
import Logo from "../components/Logo";
import { toast } from "react-toastify";

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
    placeholder: "Username",
    inputLabel: "Username",
  },
  {
    id: "email",
    type: "email",
    inputName: "email",
    placeholder: "Email",
    inputLabel: "Email",
  },
  {
    id: "password",
    type: "password",
    inputName: "password",
    placeholder: "Password",
    inputLabel: "Password",
  },
  {
    id: "confirmPassword",
    type: "password",
    inputName: "confirmPassword",
    placeholder: "Confirm Password",
    inputLabel: "Confirm Password",
  },
];

export default function Register() {
  const errorMessage = useActionData();
  const userRef = useRef();
  const navigation = useNavigation();
  const toastId = useRef(null);

  useEffect(() => {
    notify(errorMessage && errorMessage.retrunedRes, "error");
  }, [errorMessage]);

  // notify function
  const notify = (data, type = null, position = null) => {
    if (!toast.isActive(toastId.current)) {
      toastId.current = toast(data, {
        type: `${type || "default"}`,
        position: `${position || "top-right"}`,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: false,
        pauseOnFocusLoss: true,
      });
    }
  };

  return (
    <main className="md:mx-6 mx-4 main-auth">
      <Logo />
      <div className="flex py-2 flex-col mx-auto justify-center items-center min-h-screen">
        <h1 className="lg:text-4xl md:text-3xl text-2xl leading-10 text-center font-semibold md:mb-4 mb-3 text-sky-500">
          Create Account
        </h1>
        <p className="font-semibold lg:text-lg md:text-base text-sm text-center">
          Create an account so you join our community
        </p>

        <Form
          method="post"
          ref={userRef}
          className="lg:w-1/2 md:w-2/3 sm:w-3/4 w-full mx-auto"
          replace
        >
          <div className="profile py-2 flex flex-col justify-center">
            {inputs.map((inputData) => (
              <Input
                {...inputData}
                key={inputData.id}
                errorMessage={errorMessage && errorMessage.ValidationErrors}
              />
            ))}

            <button
              type="submit"
              className="w-full px-3 py-2 lg:text-2xl md:text-xl text-lg text-white rounded-lg mt-4 bg-sky-500"
              disabled={navigation.state === "submitting"}
            >
              {navigation.state === "submitting" ? "Submitting ..." : "Submit"}
            </button>
          </div>

          <div className="text-center pt-4 md:text-base text-sm">
            <span className="text-gray-800 tracking-tight">
              Already have an account?
              <Link to="/login" className="text-red-600 pl-1">
                Login Now
              </Link>
            </span>
          </div>
        </Form>
      </div>
    </main>
  );
}
