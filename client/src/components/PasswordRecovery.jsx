import { useEffect, useState } from "react";
import { generateOTP, getUser, verifyOTP } from "../utils/apiRequests";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import Logo from "./Logo";
import DisplayError from "./DisplayError";

export default function PasswordRecovery() {
  const [OTP, setOTP] = useState("");
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setOTP(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(OTP);
    setError(null);
    try {
      const username = searchParams.get("username");
      if (!OTP) throw new Error("Please write the code first");
      const { status } = await verifyOTP({
        username,
        code: OTP,
      });

      if (status === 201) navigate(`/reset-password?username=${username}`);
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    console.log(OTP);
  }, [OTP]);

  return (
    <main className="md:mx-6 mx-4">
      <Logo />
      <div className="flex justify-center items-center flex-col h-screen">
        <h1 className="lg:text-4xl md:text-3xl text-2xl leading-10 text-center font-semibold md:mb-4 mb-3 text-sky-500">
          Confirm Your Email
        </h1>

        <p className="font-semibold lg:text-lg md:text-base text-sm text-center mb-2">
          We’ve sent 5 digits verification code to your email
        </p>

        <DisplayError error={error} />

        <form method="post" onSubmit={handleSubmit}>
          <div className="flex flex-col justify-center items-center">
            <input
              type="text"
              name="otp"
              id="otp"
              onChange={handleChange}
              placeholder="code here"
              className="w-full my-1 px-3 py-2 rounded-lg bg-sky-50 focus:outline-sky-500 focus:border-none lg:text-lg md:text-base text-sm"
              autoComplete="off"
            />
            <button
              type="submit"
              className="w-full px-3 py-2 lg:text-2xl md:text-xl text-lg text-white rounded-lg mt-4 bg-sky-500"
            >
              Verify
            </button>
          </div>
        </form>
        <div className="text-center pt-4 md:text-base text-sm">
          <span className="text-gray-800 tracking-tight">
            Cannot get the number?
            <button
              onClick={() => navigate("/recovery-email-send")}
              className="text-red-500 pl-1"
            >
              Resend
            </button>
          </span>
        </div>
      </div>
    </main>
  );
}
