import { useEffect, useState } from "react";

export default function PasswordRecovery() {
  const [OPT, setOPT] = useState("");

  const handleChange = (e) => {
    setOPT(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(OPT);
  };

  useEffect(() => {
    console.log(OPT);
  }, [OPT]);

  return (
    <main className="flex flex-col justify-center items-center h-screen">
      <h1 className="leading-5">
        Enter the 6 digits sent to your email address
      </h1>

      <form method="post" onSubmit={handleSubmit}>
        <div className="flex flex-col justify-center items-center">
          <input
            type="text"
            name="opt"
            id="opt"
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

        <div className="text-center py-4">
          <span className="text-gray-500">
            Cannot get the number?
            <button to="/register" className="text-red-500 pl-1">
              Resend
            </button>
          </span>
        </div>
      </form>
    </main>
  );
}
