import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { UserContext } from "../context/UserContext";
import { unique } from "../utils/helpers";
import TimeAgo from "javascript-time-ago";
import ChatTopBar from "../components/ChatTopBar";

const timeAgo = new TimeAgo("en-US");

export default function UserChat({
  toggleChat,
  setCurrentContact,
  setCurrentContactId,
  handleRemoveConv,
  getUser,
  currentContact,
  onlineUsers,
  currentContactId,
  setError,
  messages,
  setMessages,
  chatOpen,
  updateInfo,
  msgRef,
  filteredUsers,
}) {
  const [newMessage, setNewMessage] = useState("");
  const [deleteMessage, setDeleteMessage] = useState(false);
  const { id, ws } = useContext(UserContext);

  useEffect(() => {
    if (currentContactId && chatOpen) {
      axios
        .get(`/messages/${currentContactId}`)
        .then((res) => {
          setMessages(res.data);
        })
        .catch(() => {
          setError("Sorry an error occurred, please try again later!");
        });

      if (currentContact.info?.unReadMessagesNum > 0) {
        axios.put(`/messages/setRead/${currentContactId}`).catch((err) => {
          setError(
            err.response?.data?.error ||
              "Something went wrong, refresh please!,or comeback later"
          );
        });
      }
    }

    updateInfo(currentContactId, { unReadMessagesNum: 0 }, false);

    return () => {
      try {
        axios.put(`/messages/setRead/${currentContactId}`).catch((err) => {
          setError(
            err.response?.data?.error ||
              "Something went wrong, refresh please!,or comeback later"
          );
        });
      } catch (err) {
        setError(
          err.response?.data?.error ||
            "Something went wrong, refresh please!,or comeback later"
        );
      }
    };
  }, [currentContactId]);

  // Message date format

  let dateTimeinfo = (date) => timeAgo.format(new Date(date));

  // handle sending message
  const sendMessage = (e, file = null) => {
    if (e) {
      e.preventDefault();
      ws.send(
        JSON.stringify({
          conv: currentContactId,
          text: newMessage,
          file,
          users: currentContact?.users,
        })
      );
    }

    if (file) {
      ws.send(
        JSON.stringify({
          conv: currentContactId,
          users: currentContact?.users,
          text: newMessage,
          file,
        })
      );
    }

    setNewMessage("");
    scrollToElement();
  };

  const scrollToElement = () => {
    msgRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  // send pics
  function sendFile(e) {
    const reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = () => {
      sendMessage(null, {
        filename: e.target.files[0].name,
        data: reader.result,
      });
    };
  }

  // remove message duplication from the message list
  let dupesFreeMessages = unique(messages, "_id");

  // handling deleting a message
  const handleDeleteMessage = async (messageId) => {
    try {
      const res = await axios.delete(
        `/messages/${currentContactId}/${messageId}`
      );
      if (res.status === 200) {
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      }
      // update the ui here
    } catch (err) {
      setError("Something went wrong, please try again later");
    }
  };

  return (
    <>
      {/* top bar */}
      <ChatTopBar
        toggleChat={toggleChat}
        setCurrentContact={setCurrentContact}
        setCurrentContactId={setCurrentContactId}
        handleRemoveConv={handleRemoveConv}
        currentContact={currentContact}
        getUser={getUser}
        onlineUsers={onlineUsers}
        setDeleteMessage={setDeleteMessage}
        messagesLength={messages.length}
        setError={setError}
      />

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
              className={`text-left inline-block px-3 pt-1 pb-2 my-2 rounded-md text-md ${
                message.sender === id
                  ? "bg-sky-500 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {/* datetime info / delete message */}
              <div className="flex gap-2 justify-between items-center mb-2">
                <span
                  className={`text-gray-500 text-xs whitespace-nowrap ${
                    message.sender === id ? " text-gray-200" : " text-gray-300"
                  }`}
                >
                  {dateTimeinfo(message.createdAt)}
                </span>

                {deleteMessage && (
                  <span
                    className="text-black text-sm whitespace-nowrap cursor-pointer"
                    onClick={() => handleDeleteMessage(message._id)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-3 h-3"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18 18 6M6 6l12 12"
                      />
                    </svg>
                  </span>
                )}
              </div>
              <div>{message.text}</div>
              {message.file && (
                <div>
                  <LazyLoadImage
                    src={`http://localhost:8800/api/uploads/${message.file}`}
                    className="max-h-[90vh] max-w-full object-cover"
                    effect="blur"
                  />
                </div>
              )}
            </div>
          </div>
        ))}

        <div
          id="anchor"
          className="bg-red-500 border-black"
          style={{ minHeight: "1rem" }}
          ref={msgRef}
        ></div>
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

        <button className="bg-sky-500 p-2 text-white rounded-sm" type="submit">
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
    </>
  );
}

// react api docs
