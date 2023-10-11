import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

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

        <div className="text-center py-4">
          <span className="text-gray-500">
            Not a Member?
            <Link to="/register" className="text-red-500 pl-1">
              Register Now
            </Link>
          </span>
        </div>
      </form>
    </div>
  );
}
