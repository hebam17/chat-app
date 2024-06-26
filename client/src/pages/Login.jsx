import {
  Link,
  Form,
  useActionData,
  redirect,
  useNavigation,
  useLoaderData,
  useSearchParams,
} from "react-router-dom";
import Input from "../components/Input";
import { loginValidation } from "../utils/validations";
import axios from "axios";
import { useEffect, useRef } from "react";

import Logo from "../components/Logo";
import { toast } from "react-toastify";

export const loader = async ({ request }) => {
  return new URL(request.url).searchParams.get("message");
};

export const action =
  (userContextData) =>
  async ({ request }) => {
    const data = await request.formData();
    let ValidationErrors = loginValidation(data);
    const { setUsername, setId, setConvs, setFriends } = userContextData;

    const pathname =
      new URL(request.url).searchParams.get("redirectTo") || "/chat";
    if (Object.keys(ValidationErrors).length === 0) {
      // register backend request goes here
      try {
        const res = await axios.post("/login", {
          username: data.get("username"),
          password: data.get("password"),
        });
        setUsername(data.get("username"));
        setId(res.data["id"]);
        setConvs(res.data["conv"]);
        setFriends(res.data["friends"]);
        return redirect(`${pathname}?message=User logged in successfully`);
      } catch (error) {
        return {
          returnedRes:
            error?.response?.data.error ||
            "Sorry, an error occurred, please try again later!",
        };
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
    id: "password",
    type: "password",
    inputName: "password",
    placeholder: "Password",
    inputLabel: "Password",
  },
];

export default function Login() {
  const errorMessage = useActionData();
  const navigation = useNavigation();
  const message = useLoaderData();
  const toastId = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // to get the url message and notify it
  useEffect(() => {
    const message = searchParams.get("message");
    notify((errorMessage && errorMessage.returnedRes) || message, "info");
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
          Login
        </h1>

        <p className="font-semibold lg:text-lg md:text-base text-sm text-center">
          Welcome back you’ve been missed!
        </p>

        <Form
          method="post"
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
              {navigation.state === "submitting" ? "Logging in ..." : "Login"}
            </button>
          </div>

          <div className="text-center py-2 md:text-base text-sm">
            <span className="text-gray-800 tracking-tight">
              Not a Member?
              <Link to="/register" className="text-red-600 pl-1">
                Register Now
              </Link>
            </span>
          </div>

          <div className="text-center mt-1 md:text-base text-sm">
            <Link to="/recovery-email-send" className="text-red-600 pl-1">
              Forget password?
            </Link>
          </div>
        </Form>
      </div>
    </main>
  );
}
