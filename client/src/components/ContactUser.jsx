/* eslint-disable react/prop-types */
import { useContext, useEffect, useState } from "react";
import Avatar from "./Avatar";
import { UserContext } from "../context/UserContext";

export default function ContactUser({
  userId,
  selected = false,
  username,
  online,
  handleAdding = null,
  contact = false,
  conv = false,
  privateConv = false,
  convUsers = [],
  setContact = () => {},
  AddingToGroup = () => {},
  removingFromGroup = () => {},
  removeConv = () => {},
  createGroup = false,
}) {
  const [convName, setConvName] = useState(null);
  const [inGroup, setInGroup] = useState(false);
  const { username: myUsername, id } = useContext(UserContext);

  useEffect(() => {
    if (conv && privateConv) {
      let newConvName = username
        .split("-")
        .filter((user) => user !== myUsername)[0];
      setConvName(newConvName);
    }
  }, [contact, createGroup]);

  return (
    <div className="flex justify-between items-center pr-4">
      <div
        key={userId}
        className={`flex items-center gap-2 border-b border-gray-100 mb-2 cursor-pointer ${
          selected && "bg-green-50"
        }`}
        onClick={() => setContact(userId)}
      >
        {selected && <div className="p-1 bg-green-500 h-12 rounded-r-sm"></div>}
        <div className="flex gap-2 pl-4 items-center">
          <Avatar
            online={online}
            username={convName ?? username}
            userId={userId}
          />
          <span className="text-gray-800">
            {conv && privateConv ? convName : username}
          </span>
          <div className="flex items-center">
            {conv && !privateConv && "group"}
          </div>
        </div>
      </div>
      {conv && (
        <button
          type="button"
          className="bg-green-400 px-3 py-1 rounded-md text-white"
          onClick={() => removeConv(userId, privateConv, convUsers)}
        >
          delete
        </button>
      )}

      {createGroup &&
        (!inGroup ? (
          <button
            type="button"
            className="bg-green-400 w-9 h-9 rounded-md text-white text-lg"
            onClick={() => {
              setInGroup(true);
              AddingToGroup(userId);
            }}
          >
            +
          </button>
        ) : (
          <button
            type="button"
            className="bg-green-400 w-9 h-9 rounded-md text-white text-lg"
            onClick={() => {
              setInGroup(false);
              removingFromGroup(userId);
            }}
          >
            -
          </button>
        ))}

      {!createGroup && !conv && !contact && (
        <button
          type="button"
          className="bg-green-400 px-3 py-1 rounded-md text-white"
          onClick={() => handleAdding(username, userId)}
        >
          Add
        </button>
      )}
    </div>
  );
}
