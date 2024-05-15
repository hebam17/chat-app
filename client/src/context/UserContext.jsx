import { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [username, setUsername] = useState(null);
  const [id, setId] = useState(null);
  const [convs, setConvs] = useState(null);
  const [friends, setFriends] = useState(null);
  const [ws, setWs] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getAccessToken = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/refresh");
        const { userId, username } = jwtDecode(res.data.accessToken);
        setAccessToken(res.data.accessToken);
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${res.data.accessToken}`;
        setId(userId);
        setUsername(username);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };

    if (!accessToken) getAccessToken();
  }, []);

  let content = (
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
        accessToken,
        setAccessToken,
      }}
    >
      {children}
    </UserContext.Provider>
  );

  if (!loading) return content;
}
