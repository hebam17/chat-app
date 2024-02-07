import {
  Form,
  Link,
  redirect,
  useActionData,
  useNavigate,
} from "react-router-dom";
import Input from "./Input";
import { generateOTP } from "../utils/apiRequests";
import Logo from "./Logo";
import DisplayError from "./DisplayError";
import { EmailValidation } from "../utils/validations";

const EmailInputs = {
  id: "recovery-email",
  type: "email",
  inputName: "recoveryEmail",
  placeholder: "Enter your Email",
  inputLabel: "Recovery email",
};

export const action = async ({ request }) => {
  const data = await request.formData();
  const email = data.get("recoveryEmail");
  try {
    if (!email.trim()) return "Please write your email first";
    if (!EmailValidation(email)) return "Please provide a valide email";
    const { username, code } = await generateOTP(email);
    console.log("code:", code);
    return redirect(`/recovery?username=${username}`);
  } catch (error) {
    return error.message;
  }
};

export default function RecoveryEmailSend() {
  const errorMessage = useActionData();
  const navigation = useNavigate();

  return (
    <main className="md:mx-6 mx-4">
      <Logo />
      <div className="flex justify-center items-center flex-col h-screen">
        <h1 className="lg:text-4xl md:text-3xl text-2xl leading-10 text-center font-semibold md:mb-4 mb-3 text-sky-500">
          Reset Your Password
        </h1>
        <p className="font-semibold lg:text-lg md:text-base text-sm text-center mb-2">
          Enter your email adress below and we’ll send you a link with
          instructions
        </p>

        <DisplayError error={errorMessage} />

        <div className="lg:w-1/2 md:w-2/3 sm:w-3/4 w-full mx-auto">
          <Form
            method="post"
            className="profile py-2 flex flex-col justify-center"
          >
            <Input {...EmailInputs} errorMessage={errorMessage} />
            <button
              type="submit"
              className="w-full px-3 py-2 lg:text-2xl md:text-xl text-lg text-white rounded-lg mt-4 bg-sky-500"
              disabled={navigation.state === "submitting"}
            >
              {navigation.state === "submitting"
                ? "Sending ..."
                : "Send Verification Code"}
            </button>
          </Form>
        </div>
        <div className="text-center pt-4 md:text-base text-sm">
          <span className="text-gray-800 tracking-tight">
            remembered the password?
            <Link to="/login" className="text-red-600 pl-1">
              Login Now
            </Link>
          </span>
        </div>
      </div>
    </main>
  );
}
