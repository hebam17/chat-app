import { useEffect } from "react";
import Avatar from "./Avatar";

export default function UserIdCard({ friends, onlineUsers }) {
  const { isPrivate, members } = friends;

  const isOnline = !isPrivate
    ? false
    : Object.keys(onlineUsers).includes(members[0]._id);

  return (
    <div className="flex items-center gap-3">
      <>
        <div className="flex flex-col items-center">
          {/* name */}
          <div className="md:text-base text-sm font-semibold text-sky-500">
            {isPrivate ? (
              members[0].username
            ) : (
              <div className="delete-conv relative cursor-pointer">
                group
                <p className="bg-black text-white text-sm delete-tip absolute rounded-lg top-10 shadow-md left-0 px-2 py-1">
                  {members.reduce(
                    (total, member) => total + `${member.username}\n`,
                    ""
                  )}
                </p>
              </div>
            )}
          </div>
          {/* online */}
          <div className="md:text-sm text-xs">
            {isOnline ? "Online" : "Off"}
          </div>
        </div>
        <Avatar />
      </>
    </div>
  );
}
