import { useContext, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import {
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
  useNavigation,
} from "react-router-dom";
import axios from "axios";

export default function AuthRequired() {
  const { username, setId, setUsername, id } = useContext(UserContext);
  const location = useLocation();
  const pathname = location.pathname;

  if (username) return <Outlet />;

  return (
    <Navigate
      to={`/login?message=You must login first&redirectTo=${pathname}`}
    />
  );
}

export function AuthDenied() {
  const { username } = useContext(UserContext);
  const navigate = useNavigate();

  if (username) return navigate(-1);
  if (!username) return <Outlet />;
}
