import { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [username, setUsername] = useState(null);
  const [id, setId] = useState(null);
  const [convs, setConvs] = useState(null);
  const [friends, setFriends] = useState(null);
  const [ws, setWs] = useState(null);


  // https://www.techradiant.com/2023/08/14/how-to-read-a-cookie-in-react-js/
  const readCookie = (name) => {
    const cookieString = document.cookie;
    const cookies = cookieString.split("; ");

    for (const cookie of cookies) {
      const [cookieName, cookieValue] = cookie.split("=");
      const token = cookieName === name && cookieValue;
      if (token) return jwtDecode(token);
    }

    return null; // Cookie not found
  };

  const cookieValue = readCookie("token");
  useEffect(() => {
    // get username and id from cookie and set the context values
    if (cookieValue !== null) {
      setId(cookieValue?.userId);
      setUsername(cookieValue?.username);
    }
  }, [cookieValue]);

  return (
    <UserContext.Provider
      value={{
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
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
