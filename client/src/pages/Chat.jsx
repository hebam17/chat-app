import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../context/UserContext";
import DisplayError from "../components/DisplayError";
import Logo from "../components/Logo";
import { unique } from "../utils/helpers";
import axios from "axios";
import ContactUser from "../components/ContactUser";

export const loader =
  (userContextData) =>
  async ({ request }) => {
    const { convs, setConvs, setFriends, friends } = userContextData;

    if (convs === null) {
      try {
        const res = await axios.get("/convs/getConvs");
        const data = res.data;
        setConvs(data?.convs);
        setFriends(data?.friends);
      } catch (err) {
        console.log(err);
      }
    }
    return new URL(request.url).searchParams.get("message");
  };

export default function Chat() {
  const [ws, setWs] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const [users, setUsers] = useState([]);

  const { username, setUsername, id, setId, convs, setConvs, friends } =
    useContext(UserContext);
  const [currentContactId, setCurrentContactId] = useState(null);
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

  const scrollToElement = () => {
    msgRef.current?.scrollIntoView(false);
  };

  useEffect(() => {
    axios.get("/users").then((res) => {
      setUsers(res.data);
    });
  }, [onlineUsers]);

  useEffect(() => {
    if (currentContactId) {
      axios
        .get(`/messages/${currentContactId}`)
        .then((res) => {
          setMessages(res.data);
        })
        .catch(() => {
          setError("Sorry an error occurred, please try again later!");
        });
    }
  }, [currentContactId]);

  // scroll to the bottom when both the current contact and the messages change
  useEffect(() => {
    scrollToElement();
  }, [[messages, currentContactId]]);

  function handleMessage(e) {
    const msg = JSON.parse(e.data);
    if ("online" in msg) {
      getOnlineUsers(msg.online);
    } else if ("text" in msg) {
      if (msg.sender !== id) {
        setMessages((prev) => [
          ...prev,
          {
            ...msg,
          },
        ]);
      }
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

  const sendMessage = (e, file = null) => {
    if (e) {
      e.preventDefault();
      ws.send(
        JSON.stringify({
          conv: currentContactId,
          text: newMessage,
          file,
          users: currentContact.users,
        })
      );

      setMessages((prev) => [
        ...prev,
        {
          _id: Date.now(),
          text: newMessage,
          conv: currentContactId,
          file: null,
          sender: id,
          users: currentContact.users,
        },
      ]);
    }

    if (file) {
      ws.send(
        JSON.stringify({
          conv: currentContactId,
          users: currentContact.users,
          text: newMessage,
          file,
        })
      );

      axios
        .get(`/messages/${currentContactId}`)
        .then((res) => {
          setMessages(res.data);
        })
        .catch(() => {
          setError("Sorry an error occurred, please try again later!");
        });
    }

    setNewMessage("");
  };

  function sendFile(ev) {
    const reader = new FileReader();
    reader.readAsDataURL(ev.target.files[0]);
    reader.onload = () => {
      sendMessage(null, {
        filename: ev.target.files[0].name,
        data: reader.result,
      });
    };
  }

  // handle conversation click to set the current conversation
  const setContact = async (conv) => {
    setCurrentContactId(conv._id);
    setCurrentContact(conv);
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

  // handle adding new user to the conversations list
  const handleAdding = async (username, contactname, userId, contactId) => {
    console.log("contactname:", username, contactname, userId, contactId);
    try {
      if (!(userId === contactId)) {
        const newConv = await axios.post("/convs/addConv", {
          isPrivate: true,
          name: `${username}-${contactname}`,
          users: [userId, contactId],
        });

        setCurrentContactId(newConv._id);
        setConvs((prevConvs) => [...prevConvs, newConv]);
      }
    } catch (err) {
      console.log(err);
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

          {convs.map((conv) => (
            <ContactUser
              key={conv._id}
              userId={conv._id}
              online={true}
              username={conv.name}
              myUsername={username}
              setContact={() => setContact(conv)}
              selected={conv._id === currentContactId}
              contact={true}
              conv={true}
              privateConv={conv.isPrivate}
            />
          ))}
          {users.map((user) => {
            if (!friends.includes(user._id) && user._id !== id) {
              return (
                <ContactUser
                  key={user._id}
                  userId={user._id}
                  online={true}
                  username={user.username}
                  handleAdding={(contactname, contactId) =>
                    handleAdding(username, contactname, id, contactId)
                  }
                />
              );
            } else if (user._id !== id) {
              return (
                <ContactUser
                  key={user._id}
                  userId={user._id}
                  online={true}
                  username={user.username}
                  contact={true}
                />
              );
            }
          })}
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

          {!currentContactId && (
            <div className="flex h-full items-center justify-center">
              <div className="text-gray-400">&larr; Select a person</div>
            </div>
          )}

          {currentContactId && (
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
                        ? "text-left mr-6 sm:mr-4 lg:mr-8"
                        : "text-right ml-6 sm:mr-4 lg:ml-8"
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
                      {message.file && (
                        <div>
                          <a
                            href={`${axios.defaults.baseURL}/uploads/${message.file}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <img
                              src={`http://localhost:8800/api/uploads/${message.file}`}
                              className="max-h-[90vh] max-w-full object-cover"
                            />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <div id="anchor" className="h-2" ref={msgRef}></div>
              </div>
            </div>
          )}
        </div>

        {currentContactId && (
          <form className="flex gap-2" onSubmit={sendMessage}>
            <input
              type="text"
              className="flex-grow border bg-white p-2 rounded-sm"
              placeholder="Type your message here"
              name="message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <label className="bg-gray-200 text-gray-500 p-2 rounded-sm border border-gray-300 cursor-pointer">
              <input
                type="file"
                name="file"
                id="file"
                className="hidden"
                onChange={sendFile}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6"
              >
                <path
                  fillRule="evenodd"
                  d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z"
                  clipRule="evenodd"
                />
              </svg>
            </label>

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
