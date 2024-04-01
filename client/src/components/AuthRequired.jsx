import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";

export default function AuthRequired() {
  const { username } = useContext(UserContext);
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

  if (username) return navigate("/chat");
  if (!username) return <Outlet />;
}
