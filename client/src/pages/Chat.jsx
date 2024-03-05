import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../context/UserContext";
import DisplayError from "../components/DisplayError";
import Logo from "../components/Logo";
import { unique } from "../utils/helpers";
import axios from "axios";
import ContactUser from "../components/ContactUser";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

import UserIdCard from "../components/UserIdCard";
import { Link, Outlet, useNavigate } from "react-router-dom";

export const loader =
  (userContextData) =>
  async ({ request }) => {
    const { username, convs, setConvs, setFriends, friends } = userContextData;

    if (convs === null) {
      try {
        const res = await axios.get("/convs/getConvs");
        const data = res.data;
        // split the conv name to only display the other person name => in case of private convs
        data?.convs.forEach((conv) => {
          conv.isConv = true;
          if (conv.isPrivate) {
            conv.name = conv.name
              .split("-")
              .filter((user) => user !== username)[0];
          }
        });
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
  const navigate = useNavigate();

  const {
    username,
    setUsername,
    id,
    setId,
    convs,
    setConvs,
    friends,
    setFriends,
  } = useContext(UserContext);
  const [currentContactId, setCurrentContactId] = useState(null);
  const [currentContact, setCurrentContact] = useState(null);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [type, setType] = useState("friends");
  const [messages, setMessages] = useState([]);
  const [createGroup, setCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [group, setGroup] = useState([]);
  const [searchUser, setSearchUser] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const msgRef = useRef();

  useEffect(() => {
    wsConnection();
  }, [groupName]);

  useEffect(() => {
    setFilteredUsers(searchUserFilter(searchUser));
  }, [searchUser, users]);

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
    axios.post("/users", { convs: convs }).then((res) => {
      setUsers(res.data.users);
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

    setOnlineUsers(users ?? []);
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

  // handle adding new user to the conversations list // private conversation between this user and the current user
  const handleAdding = async (username, contactname, userId, contactId) => {
    try {
      if (!(userId === contactId)) {
        const newConv = await axios.post("/convs/addConv", {
          isPrivate: true,
          name: `${username}-${contactname}`,
          // send all users other than the current user
          users: [contactId],
        });
        // setCurrentContactId(newConv._id);
        setConvs((prevConvs) => [...prevConvs, newConv.data]);
        setFriends((prev) => [...prev, contactId]);
        let newFilterdList = filteredUsers.filter(
          (user) => user.username !== contactname
        );
        newConv.data["name"] = contactname;
        newConv.data["isConv"] = true;
        setFilteredUsers([newConv.data, ...newFilterdList]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // adding a user to the group
  const AddingToGroup = (userID) => {
    setGroup((prev) => [...prev, userID]);
  };

  // removing a user from the group
  const removingFromGroup = (userID) => {
    setGroup((prev) => prev.filter((user) => user !== userID));
  };

  // create the group
  const handleCreateGroup = async () => {
    try {
      if (!groupName || group.length === 0) {
        setError("no Group was created!");
      } else {
        const newConv = await axios.post("/convs/addConv", {
          isPrivate: false,
          name: groupName,
          users: group,
        });
        newConv.data.isConv = true;
        setConvs((prev) => [...prev, newConv.data]);
        setFilteredUsers((prev) => [newConv.data, ...prev]);
      }

      setGroupName("");
      setGroup([]);
      setCreateGroup((prev) => !prev);
    } catch (err) {
      console.log(err);
    }
  };

  const removeConv = async (convID, isPrivate, users) => {
    try {
      await axios.get(`/convs/deleteConv/${convID}`);
      let newConvsList = convs.filter((conv) => conv._id !== convID);
      setConvs(newConvsList);
      // if it's a private conv
      if (isPrivate) {
        const convFriend = users.filter((user) => user !== id)[0];
        // remove the user from the friends and contacts list
        let newFriendsList = friends.filter((friend) => friend !== convFriend);
        setFriends(newFriendsList);
        let newFilterdList = filteredUsers.filter(
          (user) => user._id !== convID
        );

        setFilteredUsers([
          { _id: convFriend, username: currentContact.name },
          ...newFilterdList,
        ]);
      } else {
        let newFilterdList = filteredUsers.filter(
          (user) => user._id !== convID
        );

        setFilteredUsers([...newFilterdList]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // fix the unfriend proplem
  const handleRemoveConv = () => {
    try {
      removeConv(
        currentContactId,
        currentContact.isPrivate,
        currentContact.users
      );
      setChatOpen(false);
      setCurrentContact(null);
      setCurrentContactId(null);
      return navigate("/chat");
    } catch (err) {
      console.log(err);
    }
  };

  const isOnline = (users) => {
    let onlines =
      users?.map((user) => Object.keys(onlineUsers).includes(user)) || [];
    return onlines.every((online) => online === true);
  };

  // get user from the user list using conv
  const getUser = (currentConv) => {
    let members = currentConv.users.filter((user) => user !== id);
    if (currentConv.isPrivate) {
      members = users.filter((user) => user._id === members[0]);
      return { isPrivate: true, members: members };
    } else {
      members = users.filter((user) => members.includes(user._id));
      return { isPrivate: false, members };
    }
  };

  // toggle the chat window
  const toggleChat = (open) => {
    setChatOpen(open);
  };

  const searchUserFilter = (searchFiter) => {
    const otherUsers = users.filter(
      (user) => !friends.includes(user._id) && user._id !== id
    );
    const searchList = [...convs, ...otherUsers];
    const filteredUsers = searchList.filter((user) => {
      return (
        user.name?.toLowerCase().includes(searchFiter?.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchFiter?.toLowerCase())
      );
    });

    return filteredUsers;
  };

  // remove the current user from his contactors list
  const otherOnlineUsers = { ...onlineUsers };
  delete otherOnlineUsers[id];

  // remove message duplication from the message list
  const dupesFreeMessages = unique(messages, "_id");

  return (
    <>
      <div className="chat flex flex-col h-screen lg:px-8 md:px-5 px-4 m-0 py-3 lg:gap-10 md:gap-8 gap-6">
        {/* Header start */}

        <header
          className={`flex sm:flex-row flex-col-reverse items-start gap-3 ${
            createGroup ? "justify-between" : "justify-end"
          }`}
        >
          {/* the group submittion button */}

          {!createGroup && <Logo color="white" />}
          {createGroup && (
            <div className="flex gap-4">
              <button
                type="button"
                value="create group"
                className="p-1 text-white hover:text-sky-500 font-semibold
            hover:bg-white
            border-2 border-white rounded-lg"
                onClick={handleCreateGroup}
              >
                Done
              </button>
              <input
                type="text"
                name="group"
                id={id}
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full my-1 px-3 py-2 rounded-lg bg-sky-50 outline-none
                 border-none lg:text-lg md:text-base text-sm font-semibold"
                autoComplete="off"
                placeholder="group name..."
              />
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              value="create group"
              className="p-1 text-white hover:text-sky-500 font-semibold
            hover:bg-white
            border-2 border-white rounded-lg"
              onClick={() => setCreateGroup((prev) => !prev)}
            >
              {createGroup ? "undo" : "Create group"}
            </button>

            <button
              type="button"
              onClick={logout}
              value="logout"
              className="p-1 text-white font-semibold italic border-b-2 border-white"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Header end */}

        {/* Main start */}
        <main
          className={`flex md:flex-row flex-col md:justify-center items-center flex-1 min-h-0`}
        >
          {/* Side bar */}
          <div
            className={`bg-white rounded-md p-1 flex flex-col h-full ${
              chatOpen
                ? "border md:border-r-2 border-r-0 border-gray-2 md:w-1/3 w-full  md:rounded-r-none md:flex hidden"
                : "lg:w-1/3 md:w-2/3 w-full"
            }`}
          >
            <div className="side-header">
              <h1 className="my-4 mx-3 font-semibold text-black lg:text-xl md:text-lg text-base ">
                Welcome back,{" "}
                <span className="font-bold text-sky-500">{username}</span>
              </h1>

              <div className="search p-3 flex items-center gap-2 bg-white rounded-lg text-base mb-3 mx-3 border border-gray-300 focus-within:border-sky-500">
                <span>
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
                      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                    />
                  </svg>
                </span>
                <input
                  type="search"
                  name="find friend"
                  placeholder="Search users"
                  id="search-user"
                  className="bg-white border-0 focus:border-0 active:border-0 outline-none w-full font-semibold"
                  value={searchUser}
                  onChange={(e) => {
                    setSearchUser(e.target.value);
                  }}
                />
              </div>
              <div className="flex justify-around mb-3">
                <button
                  type="button"
                  onClick={(e) => setType(e.target.value)}
                  value="friends"
                  className={`p-1 rounded-lg border border-gray-300 font-semibold italic ${
                    type === "friends"
                      ? "bg-sky-500 text-white"
                      : "bg-white text-black"
                  }`}
                >
                  Friends
                </button>
                <button
                  type="button"
                  onClick={(e) => setType(e.target.value)}
                  value="all"
                  className={`p-1 rounded-lg border border-gray-300 font-semibold italic ${
                    type === "all"
                      ? "bg-sky-500 text-white"
                      : "bg-white text-black"
                  }`}
                >
                  All users
                </button>
              </div>
            </div>

            {/* render the users after filterd by search results */}
            <div className="flex flex-col bg-white overflow-y-auto">
              {filteredUsers.length > 0 &&
                filteredUsers.map((fUser) => {
                  if (fUser.isConv) {
                    return (
                      <ContactUser
                        key={fUser._id}
                        userId={fUser._id}
                        selected={fUser._id === currentContactId}
                        username={fUser.name}
                        online={isOnline(fUser.users)}
                        contact={true}
                        conv={true}
                        privateConv={fUser.isPrivate}
                        convUsers={fUser.users}
                        setContact={() => setContact(fUser)}
                        AddingToGroup={AddingToGroup}
                        removingFromGroup={removingFromGroup}
                        removeConv={removeConv}
                        toggleChat={toggleChat}
                        createGroup={createGroup}
                      />
                    );
                  } else {
                    return (
                      type === "all" && (
                        <ContactUser
                          key={fUser._id}
                          userId={fUser._id}
                          username={fUser.username}
                          online={Object.keys(onlineUsers).includes(fUser._id)}
                          handleAdding={(contactname, contactId) =>
                            handleAdding(username, contactname, id, contactId)
                          }
                          createGroup={createGroup}
                          AddingToGroup={AddingToGroup}
                          removingFromGroup={removingFromGroup}
                          deleteConv={type === "delete"}
                        />
                      )
                    );
                  }
                })}
            </div>
          </div>

          {/* Side bar end */}

          {/* messages */}

          {/* only open the message window when the chatOpen == true */}

          {chatOpen && currentContactId && (
            <div className="flex-1 flex flex-col rounded-md md:rounded-l-none h-full bg-white">
              {/* <Outlet /> */}
              {/* top bar */}
              <div className="flex justify-between p-1 m-0 rounded-t-md md:rounded-l-none border border-b-2 border-gray-100 px-4 items-center">
                <span
                  className="text-base font-bold hover:text-sky-500 cursor-pointer"
                  onClick={() => {
                    setChatOpen(false);
                    setCurrentContact(null);
                    setCurrentContactId(null);
                  }}
                >
                  <Link to=".." relative="path">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                      />
                    </svg>
                  </Link>
                </span>
                <div className="relative delete-conv cursor-pointer">
                  <button
                    type="button"
                    className="bg-red-400 px-3 py-1 text-white font-semibold italic rounded-lg"
                    onClick={handleRemoveConv}
                  >
                    unFriend
                  </button>

                  <p
                    className={`bg-black text-white text-sm delete-tip absolute rounded-lg top-10 shadow-md left-0 px-2 py-1`}
                  >
                    unfollow and delete the entire chat
                  </p>
                </div>

                <UserIdCard
                  friends={getUser(currentContact)}
                  onlineUsers={onlineUsers}
                />
              </div>

              {/* top bar end */}

              {/* messages */}
              <div
                id="message-container"
                className="flex flex-col flex-1 p-2 overflow-auto"
              >
                {dupesFreeMessages.length === 0 && (
                  <div className="flex items-center justify-center text-gray-400 h-full">
                    &larr; Start chat
                  </div>
                )}

                {dupesFreeMessages.map((message) => (
                  <div
                    key={message._id}
                    className={`border-black ${
                      message.sender === id
                        ? "text-left mr-6 sm:mr-4 lg:mr-8"
                        : "text-right ml-6 sm:mr-4 lg:ml-8"
                    }`}
                  >
                    <div
                      className={`text-left inline-block p-2 my-2 rounded-md text-md ${
                        message.sender === id
                          ? "bg-sky-500 text-white"
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
                            <LazyLoadImage
                              src={`http://localhost:8800/api/uploads/${message.file}`}
                              className="max-h-[90vh] max-w-full object-cover"
                              effect="blur"
                            />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <div id="anchor" className="h-2" ref={msgRef}></div>
              </div>
              {/* messages end */}

              {/* // Send message input */}
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
                  className="bg-sky-500 p-2 text-white rounded-sm"
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
            </div>
          )}
        </main>

        {/* Main end */}
      </div>
    </>
  );
}
