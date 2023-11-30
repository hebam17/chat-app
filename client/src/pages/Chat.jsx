import { useContext, useEffect, useRef, useState } from "react";
import Avatar from "../components/Avatar";
import { UserContext } from "../context/UserContext";
import Logo from "../components/Logo";
import { unique } from "../utils/helpers";

export const loader = async ({ request }) => {
  return new URL(request.url).searchParams.get("message");
};

export default function Chat() {
  const [ws, setWs] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState({});
  const { username, id } = useContext(UserContext);
  const [currentContact, setCurrentContact] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const msgRef = useRef();

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8800");
    setWs(ws);
    ws.addEventListener("message", handleMessage);
  }, []);

  function handleMessage(e) {
    const msg = JSON.parse(e.data);
    if ("online" in msg) {
      getOnlineUsers(msg.online);
    } else if ("text" in msg) {
      setMessages((prev) => [
        ...prev,
        {
          ...msg,
        },
      ]);
    }
  }

  // get the currently online users list from the connection
  const getOnlineUsers = (usersArr) => {
    const users = {};

    usersArr.forEach(({ userId, username }) => {
      users[userId] = username;
    });

    setOnlineUsers(users);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    ws.send(
      JSON.stringify({
        recipient: currentContact,
        text: newMessage,
      })
    );

    setMessages((prev) => [
      ...prev,
      { text: newMessage, sender: id, recipient: currentContact },
    ]);
    setNewMessage("");

    const msgTextBox = msgRef.current;
    // scroll to the current sented message
    msgTextBox.scrollIntoView(false);
  };

  // remove the current user from his contactors list
  const otherOnlineUsers = { ...onlineUsers };
  delete otherOnlineUsers[id];

  // remove message duplication from the message list
  const dupesFreeMessages = unique(messages, "id");

  return (
    <div className="flex h-screen">
      <div className="bg-white w-1/3">
        <Logo />
        {Object.keys(otherOnlineUsers).map((userId) => (
          <div
            key={userId}
            className={`flex items-center gap-2 border-b border-gray-100 cursor-pointer ${
              userId === currentContact && "bg-green-50"
            }`}
            onClick={() => setCurrentContact(userId)}
          >
            {userId === currentContact && (
              <div className="p-1 bg-green-500 h-12 rounded-r-sm"></div>
            )}
            <div className="flex gap-2 pl-4 items-center">
              <Avatar username={onlineUsers[userId]} userId={userId} />
              <span className="text-gray-800">{onlineUsers[userId]}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col bg-green-100 w-2/3 overflow-hidden p-2">
        <div className="flex-grow">
          {!currentContact && (
            <div className="flex h-full items-center justify-center">
              <div className="text-gray-400">&larr; Select a person</div>
            </div>
          )}

          {currentContact && (
            <div className="h-full relative">
              <div
                id="message-container"
                className="overflow-y-auto absolute inset-0 pb-2"
              >
                {dupesFreeMessages.map((message, index) => (
                  <div
                    key={index}
                    className={
                      message.sender === id
                        ? "text-left mr-5"
                        : "text-right ml-5"
                    }
                  >
                    <div
                      className={` text-left inline-block p-2 my-2 rounded-md text-md ${
                        message.sender === id
                          ? "bg-green-500 text-white"
                          : "bg-white text-gray-700"
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
                <div id="anchor" ref={msgRef}></div>
              </div>
            </div>
          )}
        </div>

        {currentContact && (
          <form className="flex gap-2bg-white" onSubmit={sendMessage}>
            <input
              type="text"
              className="bg-white flex-grow border p-2 rounded-sm"
              placeholder="Type your message here"
              name="message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button
              className="bg-green-500 p-2 text-white rounded-sm"
              type="submit"
            >
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
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
