import { useEffect, useState } from "react";
import { Form, redirect, useActionData, useNavigate } from "react-router-dom";
import Input from "./Input";
import { ResetPasswordValidation } from "../utils/validations";
import { resetPassword } from "../utils/apiRequests";
import axios from "axios";
import Logo from "./Logo";
import DisplayError from "./DisplayError";

export const action = async ({ request }) => {
  const formData = await request.formData();
  let ValidationErrors = ResetPasswordValidation(formData);

  try {
    if (Object.keys(ValidationErrors).length === 0) {
      // register backend request goes here
      const username = new URL(request.url).searchParams.get("username");
      const { status } = await resetPassword({
        username,
        password: formData.get("password"),
      });
      if (status === 201) console.log("updated");
      return redirect("/login");
    } else {
      return { ValidationErrors };
    }
  } catch (error) {
    return { message: error.message };
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
  const [err, setErr] = useState(null);
  const navigation = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await axios.get("/createResetSession");
        if (res.status !== 201) return navigation("/recovery-email-send");
      } catch (error) {
        return navigation(
          `/recovery-email-send?message=${error.response.data.error}`
        );
      }
    };

    checkSession().catch((err) => setErr(err));
  }, []);

  return (
    <main className="md:mx-6 mx-4">
      <Logo />

      <div className="flex justify-center items-center flex-col h-screen">
        <h1 className="lg:text-4xl md:text-3xl text-2xl leading-10 text-center font-semibold md:mb-4 mb-3 text-sky-500">
          Reset password
        </h1>
        <p className="font-semibold lg:text-lg md:text-base text-sm text-center mb-2">
          Enter the new password
        </p>

        {/* <p className="text-red-600 text-center text-lg">
          {(errorMessage && errorMessage.message) || err}
        </p> */}

        <DisplayError error={(errorMessage && errorMessage.message) || err} />
        <div className="lg:w-1/2 md:w-2/3 sm:w-3/4 w-full mx-auto">
          <Form
            method="post"
            className="profile py-2 flex flex-col justify-center"
          >
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
              className="w-full px-3 py-2 lg:text-2xl md:text-xl text-lg text-white rounded-lg mt-4 bg-sky-500"
              disabled={navigation.state === "submitting"}
            >
              {navigation.state === "submitting" ? "reseting ..." : "reset"}
            </button>
          </Form>
        </div>
      </div>
    </main>
  );
}
