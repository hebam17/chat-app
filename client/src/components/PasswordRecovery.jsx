import { useEffect, useState } from "react";
import { generateOTP, getUser, verifyOTP } from "../utils/apiRequests";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

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
      if (!OTP) throw new Error("Please write the OTP first");
      const { status } = await verifyOTP({
        username,
        code: OTP,
      });

      if (status === 201) navigate(`/reset-password?username=${username}`);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleClick = async () => {
    setError(null);
    try {
      console.log(searchParams.get("username"));
      const user = await getUser(searchParams.get("username"));
      console.log("user:", user);
      if (user) {
        const { code } = await generateOTP(user.email);
        console.log(code);
      }
      //  add feedback for sending the new OTP
    } catch (error) {
      return setError(error.message);
    }
  };

  useEffect(() => {
    console.log(OTP);
  }, [OTP]);

  return (
    <main className="flex flex-col justify-center items-center h-screen">
      <h1 className="leading-5">
        Enter the 6 digits sent to your email address
      </h1>

      <p className="text-red-600 text-center text-lg">{error}</p>

      <form method="post" onSubmit={handleSubmit}>
        <div className="flex flex-col justify-center items-center">
          <input
            type="text"
            name="otp"
            id="otp"
            onChange={handleChange}
            placeholder="Enter the numbers here"
            className="w-50 my-2 p-2 rounded-md border border-gray-200 focus:border-blue-300 focus:outline-none "
          />
          <button
            type="submit"
            className="px-4 py-2 text-gray-800 font-semibold border border-gray-500 rounded-md"
          >
            Verify
          </button>
        </div>
      </form>
      <div className="text-center py-4">
        <span className="text-gray-500">
          Cannot get the number?
          <button onClick={handleClick} className="text-red-500 pl-1">
            Resend
          </button>
        </span>
      </div>
    </main>
  );
}
