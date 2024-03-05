/* eslint-disable react/prop-types */
import { useContext, useEffect, useState } from "react";
import Avatar from "./Avatar";
import { UserContext } from "../context/UserContext";
import { Link } from "react-router-dom";

export default function ContactUser({
  userId,
  selected = false,
  username,
  online,
  handleAdding,
  contact = false,
  conv = false,
  privateConv = false,
  setContact,
  AddingToGroup,
  removingFromGroup,
  toggleChat,
  createGroup = false,
  profile = "",
}) {
  // const [convName, setConvName] = useState(null);
  const [inGroup, setInGroup] = useState(false);
  const { username: myUsername, id } = useContext(UserContext);
  const date = new Date();

  const groupButtons = createGroup && (!conv || (conv && privateConv));

  useEffect(() => {
    !createGroup && setInGroup(false);
  }, [createGroup]);

  const newMessage = (message) => {
    return message.length > 25 ? message.slice(0, 20) + "..." : message;
  };

  return (
    <div
      className={`flex relative justify-between gap-3 p-2 my-1 rounded-lg border-1 border-gray-200 cursor-pointer bg-white ${
        selected ? "bg-sky-100" : ""
      }`}
      onClick={() => {
        if (!createGroup && conv) {
          setContact(userId);
          toggleChat(true);
        }
      }}
    >
      {!createGroup && conv && (
        <Link
          to={`/chat/${username}`}
          className="absolute top-0 left-0 h-full w-full"
        />
      )}

      <div>
        <Avatar online={online} profile={profile} isCard={true} />
      </div>

      <div className="flex justify-between flex-1">
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
          <div className="text-gray-500 font-medium lg:text-base text-sm">
            {newMessage("Tamena this is the last message")}
          </div>
        </div>

        {/* ////////// */}

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
                  AddingToGroup(userId);
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
                1day
              </div>

              {/* the number of unread messages */}
              <div className="md:text-sm text-xs rounded-full px-2 py-1 flex justify-center items-center bg-sky-500 text-white">
                2
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
