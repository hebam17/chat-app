import axios from "axios";
import { useContext } from "react";
import { Outlet } from "react-router-dom";
import { UserContext } from "../context/UserContext";

export default function Layout() {
  const { setId, setUsername } = useContext(UserContext);
  const handleClick = async () => {
    try {
      await axios.post("/logout");
      setId(null);
      setUsername(null);
    } catch (error) {
      console.log(error.response.data.error);
    }
  };
  return (
    <>
      <button
        className="border bg-green-500 text-white p-1 absolute right-0"
        onClick={handleClick}
      >
        Logout
      </button>
      <Outlet />
    </>
  );
}
