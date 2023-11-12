import { useEffect, useState } from "react";
import { Form, redirect, useActionData, useNavigate } from "react-router-dom";
import Input from "./Input";
import { ResetPasswordValidation } from "../utils/validations";
import { resetPassword } from "../utils/apiRequests";
import axios from "axios";

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
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await axios.get("/createResetSession");
        if (res.status !== 201) return navigate("/recovery-email-send");
      } catch (error) {
        return navigate(
          `/recovery-email-send?message=${error.response.data.error}`
        );
      }
    };

    checkSession().catch((err) => setErr(err));
  }, []);

  return (
    <main className="flex flex-col justify-center items-center h-screen">
      <h1 className="text-4xl my-3">Reset password</h1>
      <h2 className="text-1xl">Enter the new password </h2>

      <p className="text-red-600 text-center text-lg">
        {(errorMessage && errorMessage.message) || err}
      </p>

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
