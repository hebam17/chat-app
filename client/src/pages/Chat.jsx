import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../context/UserContext";
import Logo from "../components/Logo";
import { logout } from "../utils/helpers";
import axios from "axios";
import ContactUser from "../components/ContactUser";

import "react-lazy-load-image-component/src/effects/blur.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useLoaderData, useNavigate, useSearchParams } from "react-router-dom";
import UserChat from "./UserChat";
import { jwtDecode } from "jwt-decode";

export const loader =
  (userContextData) =>
  async ({ request }) => {
    const { username, convs } = userContextData;
    let data;
    if (convs === null) {
      try {
        const res = await axios.get("/convs/getConvs");
        data = res.data;
        // split the conv name to only display the other person name => in case of private convs
        data?.convs.forEach((conv) => {
          conv.isConv = true;
          if (conv.isPrivate) {
            conv.name = conv.name
              .split("-")
              .filter((user) => user !== username)[0];
          }
        });

        return {
          message: new URL(request.url).searchParams.get("message"),
          data: data,
        };
      } catch (err) {
        console.log(err.response?.data?.error);
      }
    } else {
      convs.forEach((conv) => {
        conv.isConv = true;
        if (conv.isPrivate) {
          conv.name = conv.name
            .split("-")
            .filter((user) => user !== username)[0];
        }
      });

      return {
        message: new URL(request.url).searchParams.get("message"),
        data: { convs },
      };
    }
  };

export default function Chat() {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { message, data } = useLoaderData();

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
    ws,
    setWs,
    setAccessToken,
    accessToken,
  } = useContext(UserContext);
  const [currentContactId, setCurrentContactId] = useState(null);
  const [currentContact, setCurrentContact] = useState(null);
  const [error, setError] = useState(null);

  const [type, setType] = useState("friends");
  const [messages, setMessages] = useState([]);
  const [createGroup, setCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [group, setGroup] = useState([]);
  const [searchUser, setSearchUser] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const msgRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const toastId = useRef(null);

  // establish the ws connection
  // display the login success message
  useEffect(() => {
    wsConnection();
    setConvs(data.convs);
    data.friends && setFriends(data.friends);
    notify(message, "success");
  }, []);

  // set timer to get the new access token every 15 minutes
  useEffect(() => {
    if (!accessToken) {
      axios.get("/refresh").then((res) => {
        const { userId, username } = jwtDecode(res.data.accessToken);
        setId(userId);
        setUsername(username);
      });
    }
    let interval = null;

    interval = setInterval(async () => {
      try {
        const result = await axios.get("/refresh");
        if (result.status !== 200) {
          clearInterval(interval);
          return;
        }
        setAccessToken(result.data.accessToken);
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${result.data.accessToken}`;
      } catch (err) {
        clearInterval(interval);
      }
    }, 2 * 1000 * 60);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    setSearchParams("");
  }, []);

  useEffect(() => {
    setFilteredUsers(searchUserFilter(searchUser));
  }, [searchUser, users]);

  useEffect(() => {
    axios.post("/users", { convs: convs }).then((res) => {
      setUsers(res.data.users);
    });
  }, [onlineUsers]);

  useEffect(() => {
    notify(error, "info");
  }, [error]);

  // notify function
  const notify = (data, type = null, position = null) => {
    if (!toast.isActive(toastId.current)) {
      toastId.current = toast(data, {
        type: `${type || "default"}`,
        position: `${position || "top-right"}`,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: false,
        pauseOnFocusLoss: true,
      });
    }
  };

  let wsInstance = null;

  // establishing a webSocket connection
  const wsConnection = () => {
    wsInstance = new WebSocket("ws://localhost:8800");
    setWs(wsInstance);
    wsInstance.addEventListener("message", handleMessage);
    wsInstance.addEventListener("close", () => {
      setTimeout(() => {
        wsInstance.removeEventListener("message", handleMessage);
        wsConnection();
      }, 1000);
    });
  };

  let date1 = null;

  function handleMessage(e) {
    const msg = JSON.parse(e.data);
    if ("online" in msg) {
      getOnlineUsers(msg.online);
    } else if ("text" in msg) {
      if (msg.sender !== id) {
        let currentContact = null;
        setCurrentContactId((prev) => {
          currentContact = prev;
          if (msg.conv === currentContact) {
            setMessages((prev) => [
              ...prev,
              {
                ...msg,
              },
            ]);
          } else {
            let date = new Date(msg.createdAt);

            if ((date1 && date1.getTime()) != date.getTime()) {
              date1 = date;
              updateInfo(
                msg.conv,
                { lastMessage: msg.text, lastDate: msg.createdAt },
                true
              );
            }
          }
          return prev;
        });
      } else if (msg.sender === id) {
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

  // handle conversation click to set the current conversation
  const setContact = async (conv) => {
    setCurrentContactId(conv._id);
    setCurrentContact(conv);
  };

  // handle adding new user to the conversations list // private conversation between this user and the current user
  const handleAdding = async (username, contactname, userId, contactId) => {
    try {
      if (userId !== contactId) {
        const newConv = await axios.post("/convs/addConv", {
          isPrivate: true,
          name: `${username}-${contactname}`,
          // send all users other than the current user
          users: [contactId],
        });

        setConvs((prevConvs) => [...prevConvs, newConv.data]);
        setFriends((prev) => [...prev, contactId]);
        let newFilterdList = filteredUsers.filter(
          (user) => user.username !== contactname
        );
        newConv.data["name"] = contactname;
        newConv.data["isConv"] = true;
        setFilteredUsers([newConv.data, ...newFilterdList]);
        notify(
          `${contactname} added to user contacts successfully.`,
          "success"
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Something went wrong, refresh please!,or comeback later"
      );
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
      if (!groupName) {
        setError("no Group was created!, you should provide a name!");
      } else if (group.length === 0) {
        setError("no Group was created!, no members added to the group!");
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

      notify(`${groupName} was created successfully`, "success");
      setGroupName("");
      setGroup([]);
      setCreateGroup((prev) => !prev);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Something went wrong, refresh please!,or comeback later"
      );
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
      setError(
        err.response?.data?.error ||
          "Something went wrong, refresh please!,or comeback later"
      );
    }
  };

  // fix the unfriend proplem
  const handleRemoveConv = (contactname) => {
    try {
      removeConv(
        currentContactId,
        currentContact.isPrivate,
        currentContact.users
      );
      setChatOpen(false);
      setCurrentContact(null);
      setCurrentContactId(null);
      notify(
        `${contactname} was removed successfully from your contact list`,
        "sucess"
      );
      return navigate("/chat");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Something went wrong, refresh please!,or comeback later"
      );
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

    const searchList = [...(convs || []), ...otherUsers];
    const filteredUsers = searchList.filter((user) => {
      return (
        user.name?.toLowerCase().includes(searchFiter?.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchFiter?.toLowerCase())
      );
    });

    return filteredUsers;
  };

  // update the conv.info object
  const updateInfo = (contact, newInfo = {}, addUnReadMessage = false) => {
    setFilteredUsers((prev) => {
      let updatedfilteredUsers = prev.map((user) => {
        let newUser;
        if (user._id === contact && user.hasOwnProperty("info")) {
          if (addUnReadMessage) {
            newUser = {
              ...user,
              info: {
                ...user.info,
                unReadMessagesNum: user.info.unReadMessagesNum + 1,
                ...newInfo,
              },
            };
          } else {
            newUser = {
              ...user,
              info: { ...user.info, ...newInfo },
            };
          }
          return newUser;
        } else if (
          user._id === contact &&
          !user.hasOwnProperty("info") &&
          addUnReadMessage
        ) {
          newInfo = {
            ...user,
            info: {
              unReadMessagesNum: user.info.unReadMessagesNum + 1,
              ...newInfo,
            },
          };
          return newUser;
        } else {
          return user;
        }
      });

      return updatedfilteredUsers;
    });
  };

  // remove the current user from his contactors list
  const otherOnlineUsers = { ...onlineUsers };
  delete otherOnlineUsers[id];

  // // remove message duplication from the message list

  return (
    <>
      <div className="chat flex flex-col h-screen lg:px-8 md:px-5 px-4 m-0 py-3 lg:gap-10 md:gap-8 gap-6">
        {/* Header start */}

        <header
          className={`flex md:flex-row md:items-center justify-between gap-3
          md:text-base text-sm
          ${
            !createGroup
              ? "flex-row items-end sm:justify-between justify-around"
              : "flex-col-reverse "
          }
          `}
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
                autoFocus
              />
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              value="create group"
              className="sm:p-1 p-0.5 text-white hover:text-sky-500 font-semibold
            hover:bg-white
            sm:border-2 border-white rounded-lg"
              onClick={() => setCreateGroup((prev) => !prev)}
            >
              {createGroup ? "undo" : "Create group"}
            </button>

            <button
              type="button"
              onClick={() =>
                logout(setWs, setId, setUsername, setAccessToken, setError)
              }
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
          className={`flex flex-row justify-center items-center flex-1 min-h-0`}
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
                        info={fUser.info}
                        users={fUser.users}
                        setContact={() => setContact(fUser)}
                        AddingToGroup={AddingToGroup}
                        removingFromGroup={removingFromGroup}
                        removeConv={removeConv}
                        toggleChat={toggleChat}
                        createGroup={createGroup}
                        msgRef={msgRef}
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
              <UserChat
                toggleChat={toggleChat}
                setCurrentContact={setCurrentContact}
                setCurrentContactId={setCurrentContactId}
                handleRemoveConv={handleRemoveConv}
                getUser={getUser}
                currentContact={currentContact}
                onlineUsers={onlineUsers}
                currentContactId={currentContactId}
                setError={setError}
                ws={ws}
                messages={messages}
                setMessages={setMessages}
                chatOpen={chatOpen}
                setContact={setContact}
                updateInfo={updateInfo}
                msgRef={msgRef}
                filteredUsers={filteredUsers}
              />
            </div>
          )}
        </main>

        {/* Main end */}
      </div>
    </>
  );
}
