import Register from "./components/Register";
import axios from "axios";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <div>Home</div>,
  },
  {
    path: "/register",
    element: <Register />,
  },
]);

function App() {
  axios.defaults.baseURL = "http://localhost:8800";
  axios.defaults.withCredentials = true;

  return <RouterProvider router={router}></RouterProvider>;
}

export default App;
