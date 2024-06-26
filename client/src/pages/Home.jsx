import { Link } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { useContext } from "react";
import { logout } from "../utils/helpers";

export default function Home() {
  const { username, setWs, setId, setUsername } = useContext(UserContext);
  return (
    <div className="flex flex-col h-screen home-bg m-0">
      {/* header */}
      <div className="flex-1 flex-grow text-right">
        {username ? (
          <div className="flex gap-2 sm:justify-end justify-around">
            <button
              type="button"
              onClick={() => logout(setWs, setId, setUsername)}
              value="logout"
              className="font-semibold inline-block mt-4 mr-4 lg:text-lg text-base hover:text-sky-500"
            >
              Logout
            </button>

            <Link
              to="/chat"
              className="font-semibold inline-block mt-4 mr-4 lg:text-lg text-base hover:text-sky-500 underline"
            >
              Chat
            </Link>
          </div>
        ) : (
          <Link
            to="/login"
            className="font-semibold inline-block mt-4 mr-4 lg:text-lg text-base hover:text-sky-500"
          >
            Login
          </Link>
        )}
      </div>

      {/* main content */}
      <div className="flex-1 flex items-center flex-col md:mt-0 mt-2 lg:px-2 md:px-4 px-5">
        <h1 className="lg:text-4xl md:text-3xl text-2xl leading-10 text-center font-semibold">
          Stay connected with your friends and family
        </h1>
        <div className="text-center flex justify-center items-center gap-1 md:my-6 my-4">
          <span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="#06b6d4"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
              />
            </svg>
          </span>
          <h3 className="font-semibold  lg:text-lg md:text-base text-sm ">
            Secure, private messaging
          </h3>
        </div>
        <Link
          to="/register"
          className="font-semibold md:py-4 md:px-20 sm:px-16 px-12 py-3 bg-white rounded-full start-btn lg:text-xl md:text-lg text-base d-block"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}
