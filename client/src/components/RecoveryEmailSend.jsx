import { Form, redirect, useActionData, useNavigate } from "react-router-dom";
import Input from "./Input";
import { generateOTP } from "../utils/apiRequests";

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
  console.log(email);
  try {
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
    <div>
      <h1 className="text-4xl text-center my-3 font-bold">
        Please enter your account email
      </h1>

      <p className="text-red-600 text-center text-lg">{errorMessage}</p>

      <div className="my-8 flex flex-col justify-center items-center">
        <Form method="post">
          <Input {...EmailInputs} errorMessage={errorMessage} />
          <button
            type="submit"
            className="border border-gray-500 w-full p-2 text-xl text-gray-500 rounded-md mt-4"
            disabled={navigation.state === "submitting"}
          >
            {navigation.state === "submitting" ? "Sending ..." : "Send"}
          </button>
        </Form>
      </div>
    </div>
  );
}
