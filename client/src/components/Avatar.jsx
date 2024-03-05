import { useEffect } from "react";
import avatarIMG from "../assets/avatar.jpg";

export default function Avatar({ online = false, profile, isCard = false }) {
  return (
    <div
      className={`w-10 h-10 relative rounded-lg flex items-center bg-gray-200 p-0`}
    >
      {profile ? (
        <img
          src={profile}
          alt="user's image"
          className="object-cover w-full h-full rounded"
        />
      ) : (
        // <svg
        //   xmlns="http://www.w3.org/2000/svg"
        //   fill="white"
        //   viewBox="0 0 24 24"
        //   strokeWidth={1.5}
        //   stroke="currentColor"
        //   className="w-full h-full"
        // >
        //   <path
        //     strokeLinecap="round"
        //     strokeLinejoin="round"
        //     d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
        //   />
        // </svg>
        <img
          src={avatarIMG}
          alt="user's image"
          className="object-cover w-full h-full rounded"
        />
      )}

      {!isCard && online && (
        <div
          className="absolute w-3 h-3 bg-green-400 bottom-0 rounded-full border border-white"
          style={{ right: "-.4rem" }}
        ></div>
      )}
      {isCard && !online && (
        <div
          className="absolute w-3 h-3 bg-gray-400 bottom-0 rounded-full border border-white"
          style={{ right: "-.4rem" }}
        ></div>
      )}
    </div>
  );
}
