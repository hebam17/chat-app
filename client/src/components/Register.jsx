import { useState, useContext } from "react";
import axios from "axios";
import { UserContext } from "../UserContext";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { setUsername: setLoggedInUsername, setId } = useContext(UserContext);

  const changeHandler = (e) => {
    if (e.target.name === "username") {
      setUsername(e.target.value);
    } else {
      setPassword(e.target.value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data } = await axios.post("/register", { username, password });
    setLoggedInUsername(username);
    setId(data.id);
  };

  return (
    <div className="bg-blue-50 h-screen flex items-center">
      <form onSubmit={handleSubmit} className="w-64 mx-auto mb-12">
        <input
          type="text"
          name="username"
          id="username"
          value={username}
          placeholder="username"
          onChange={changeHandler}
          className="block w-full rounded-md p-2 mb-2 border"
        />
        <input
          type="password"
          name="psw"
          id="psw"
          value={password}
          placeholder="password"
          onChange={changeHandler}
          className="block w-full rounded-md p-2 mb-2 border"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white block w-full rounded-md p-2"
        >
          Register
        </button>
        <div className="text-center mt-2">
          Already a member <a href="login">Login here</a>
        </div>
      </form>
    </div>
  );
}
