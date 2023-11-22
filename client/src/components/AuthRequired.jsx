import { useContext, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import axios from "axios";

export default function AuthRequired() {
  const { username, setId, setUsername } = useContext(UserContext);
  const location = useLocation();
  const pathname = location.pathname;

  useEffect(() => {
    if (!username && location.state?._isRedirect) {
      axios
        .get("/profile")
        .then((response) => {
          setId(response.data.userId);
          setUsername(response.data.username);
        })
        .catch((err) => {
          console.log(err.message);
        });
    }
  }, []);

  // if (username) return <Outlet />;

  // return (
  //   <Navigate
  //     to={`/login?message=You must login first&redirectTo=${pathname}`}
  //   />
  // );
  return <Outlet />;
}

export function AuthDenied() {
  const { username, setId, setUsername } = useContext(UserContext);

  useEffect(() => {
    if (!username) {
      axios
        .get("/profile")
        .then((response) => {
          setId(response.data.userId);
          setUsername(response.data.username);
        })
        .catch((err) => {
          console.log(err.message);
        });
    }
  }, []);

  // if (username) return <Navigate to=".." />;

  // if (!username) return <Outlet />;
  return <Outlet />;
}
