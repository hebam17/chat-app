import { useEffect, useState } from "react";
import Avatar from "./Avatar";

export default function ContactUser({
  userId,
  selected = false,
  username,
  online,
  handleAdding = null,
  contact = false,
  myUsername,
  conv = false,
  privateConv = false,
  setContact = () => {},
}) {
  const [convName, setConvName] = useState(null);

  useEffect(() => {
    if (conv && privateConv) {
      let newConvName = username
        .split("-")
        .filter((user) => user !== myUsername)[0];
      setConvName(newConvName);
    }
  }, []);

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
          <Avatar online={online} username={username} userId={userId} />
          <span className="text-gray-800">
            {conv && privateConv ? convName : username}
          </span>
        </div>
      </div>

      {!contact && (
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
