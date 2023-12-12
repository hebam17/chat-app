import { useContext, useEffect, useRef, useState } from "react";
import Avatar from "../components/Avatar";
import { UserContext } from "../context/UserContext";
import DisplayError from "../components/DisplayError";
import Logo from "../components/Logo";
import { unique } from "../utils/helpers";
import axios from "axios";
import ContactUser from "../components/ContactUser";

export const loader = async ({ request }) => {
  return new URL(request.url).searchParams.get("message");
};

export default function Chat() {
  const [ws, setWs] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [offlineUsers, setOfflineUsers] = useState({});
  const { username, setUsername, id, setId } = useContext(UserContext);
  const [currentContact, setCurrentContact] = useState(null);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const msgRef = useRef();

  useEffect(() => {
    wsConnection();
  }, []);

  let wsInstance = null;

  // establishing a webSocket connection
  const wsConnection = () => {
    wsInstance = new WebSocket("ws://localhost:8800");
    setWs(wsInstance);
    wsInstance.addEventListener("message", handleMessage);
    wsInstance.addEventListener("close", () => {
      setTimeout(() => {
        wsConnection();
      }, 1000);
    });
  };

  useEffect(() => {
    if (currentContact) {
      axios
        .get(`/messages/${currentContact}`)
        .then((res) => {
          setMessages(res.data);
        })
        .catch((err) => {
          console.log(err.response.data.error);
          setError("Sorry an error occurred, please try again later!");
        });
    }
  }, [currentContact]);

  useEffect(() => {
    axios.get("/users").then((res) => {
      const offlineUsersArr = res.data.filter((user) => {
        return !(user._id in onlineUsers);
      });

      const offlineUsers = {};

      offlineUsersArr.forEach(({ _id, username }) => {
        offlineUsers[_id] = username;
      });

      setOfflineUsers(offlineUsers);
    });
  }, [onlineUsers]);

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
      {
        _id: Date.now(),
        text: newMessage,
        sender: id,
        recipient: currentContact,
      },
    ]);
    setNewMessage("");

    const msgTextBox = msgRef.current;

    // scroll to the current sented message
    msgTextBox.scrollIntoView(false);
  };

  // log user out
  const logout = async () => {
    try {
      await axios.post("/logout");
      setWs(null);
      setId(null);
      setUsername(null);
    } catch (error) {
      console.log(error.response.data.error);
    }
  };

  // remove the current user from his contactors list
  const otherOnlineUsers = { ...onlineUsers };
  delete otherOnlineUsers[id];

  // remove message duplication from the message list
  const dupesFreeMessages = unique(messages, "_id");

  return (
    <div className="flex h-screen">
      <div className="bg-white w-1/3 flex flex-col">
        <div className="flex-grow">
          <Logo />
          {Object.keys(otherOnlineUsers).map((userId) => (
            <ContactUser
              key={userId}
              userId={userId}
              online={true}
              username={otherOnlineUsers[userId]}
              handleClick={setCurrentContact}
              selected={userId === currentContact}
            />
          ))}

          {Object.keys(offlineUsers).map((userId) => (
            <ContactUser
              key={userId}
              userId={userId}
              online={false}
              username={offlineUsers[userId]}
              handleClick={setCurrentContact}
              selected={userId === currentContact}
            />
          ))}
        </div>

        <div className="p-2 text-center flex gap-2 justify-center items-center">
          <span className="mr-2 text-sm text-gray-600 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                clipRule="evenodd"
              />
            </svg>

            {username}
          </span>
          <button
            onClick={logout}
            className="text-sm text-gray-500 bg-green-100 py-2 px-3 border rounded-md"
          >
            Logout
          </button>
        </div>
      </div>
      <div className="flex flex-col bg-green-100 w-2/3 overflow-hidden py-2">
        <div className="flex-grow">
          {error && <DisplayError error={error} />}

          {!currentContact && (
            <div className="flex h-full items-center justify-center">
              <div className="text-gray-400">&larr; Select a person</div>
            </div>
          )}

          {currentContact && (
            <div className="h-full relative">
              <div
                id="message-container"
                className="overflow-y-auto absolute inset-0 p-2"
              >
                {dupesFreeMessages.length === 0 && (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-gray-400">&larr; Start chat</div>
                  </div>
                )}
                {dupesFreeMessages.map((message) => (
                  <div
                    key={message._id}
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
          <form className="flex gap-2" onSubmit={sendMessage}>
            <input
              type="text"
              className="flex-grow border bg-white p-2 rounded-sm"
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
