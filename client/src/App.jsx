import Register from "./components/Register";
import axios from "axios";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import Login, { action as loginAction } from "./components/Login";

import ErrorMessage from "./components/ErrorMessage";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<div>Home</div>} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/login"
        element={<Login />}
        action={loginAction}
        errorElement={<ErrorMessage />}
      />
    </>
  )
);

function App() {
  axios.defaults.baseURL = "http://localhost:8800";
  axios.defaults.withCredentials = true;

  return <RouterProvider router={router}></RouterProvider>;
}

export default App;
