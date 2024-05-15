/* eslint-disable react/prop-types */
import { useContext, useEffect, useState } from "react";
import Avatar from "./Avatar";
import { UserContext } from "../context/UserContext";
import TimeAgo from "javascript-time-ago";

import en from "javascript-time-ago/locale/en";

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo("en-US");

export default function ContactUser({
  userId,
  selected = false,
  username,
  online,
  handleAdding,
  users = [],
  contact = false,
  conv = false,
  privateConv = false,
  setContact,
  AddingToGroup,
  removingFromGroup,
  toggleChat,
  createGroup = false,
  profile = "",
  msgRef,
  info = {},
}) {
  const [inGroup, setInGroup] = useState(false);
  const { id } = useContext(UserContext);

  let dateTimeinfo =
    (conv && info.lastDate && timeAgo.format(new Date(info.lastDate))) || "";

  const groupButtons = createGroup && (!conv || (conv && privateConv));

  useEffect(() => {
    !createGroup && setInGroup(false);
  }, [createGroup]);

  const thisMemberId =
    conv && privateConv && users.filter((user) => user !== id)[0];

  const newMessage = (message) => {
    return message.length > 25 ? message.slice(0, 20) + "..." : message;
  };

  const scrollToElement = () => {
    msgRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  const handleClick = () => {
    if (!createGroup && conv) {
      setContact(userId);
      toggleChat(true);

      scrollToElement();
    }
  };

  return (
    <div
      className={`flex relative justify-between gap-3 p-2 my-1 rounded-lg border-1 border-gray-200 cursor-pointer bg-white ${
        selected ? "bg-sky-100" : ""
      }`}
      onClick={handleClick}
    >
      <div>
        <Avatar online={online} profile={profile} isCard={true} />
      </div>

      <div className={`flex justify-between flex-1 ${!conv && "items-center"}`}>
        <div className="flex gap-2 flex-col">
          {/* username */}
          <div
            className={`font-semibold lg:text-lg md:text-base text-sm ${
              selected ? "text-sky-500" : "text-black"
            }`}
          >
            {username}
          </div>
          {/* the last message */}
          {!createGroup && conv && (
            <div className="text-gray-500 font-medium lg:text-base text-sm">
              {Object.keys(info).length === 0 ? (
                "start chatting..."
              ) : info?.lastMessage === "" ? (
                <span>
                  photo
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                    />
                  </svg>
                </span>
              ) : (
                newMessage(info?.lastMessage)
              )}
            </div>
          )}
          {/* ////////// */}
        </div>

        <div className="flex items-center justify-center h-full gap-2 flex-col">
          {!createGroup && !conv && !contact && (
            <button
              type="button"
              className="bg-sky-500 px-3 py-1 text-white font-semibold italic rounded-lg"
              onClick={() => handleAdding(username, userId)}
            >
              Add
            </button>
          )}

          {/* the join/unjoin group buttons */}
          {groupButtons &&
            (!inGroup ? (
              <button
                type="button"
                onClick={() => {
                  AddingToGroup(thisMemberId || userId);
                  setInGroup(true);
                }}
                className="bg-sky-500 px-3 py-1 text-white font-semibold italic rounded-lg"
              >
                join
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setInGroup(false);
                  removingFromGroup(userId);
                }}
                className="bg-sky-500 px-3 py-1 text-white font-semibold italic rounded-lg"
              >
                unJoin
              </button>
            ))}

          {createGroup && conv && !privateConv && (
            <div className="mx-2 text-sky-500 font-semibold italic rounded-lg cursor-default">
              group
            </div>
          )}
          {/* the last message date send */}

          {!createGroup && conv && (
            <>
              <div className="text-gray-500 font-medium lg:text-base text-sm whitespace-nowrap">
                {dateTimeinfo}
              </div>

              {/* the number of unread messages */}
              <div
                className={`md:text-sm text-xs rounded-full px-2 py-1 flex justify-center items-center bg-sky-500 text-white ${
                  (!info.unReadMessagesNum || info?.unReadMessagesNum === 0) &&
                  "invisible"
                }`}
              >
                {info?.unReadMessagesNum}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
