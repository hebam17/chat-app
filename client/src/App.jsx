import Register, { action as registerAction } from "./components/Register";
import axios from "axios";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import Login, { action as loginAction } from "./components/Login";

import ErrorMessage from "./components/ErrorMessage";
import PasswordRecovery from "./components/PasswordRecovery";
import ResetPassword, {
  action as resetPasswordAction,
  // loader as resetPasswordLoader,
} from "./components/ResetPassword";
import Home, { loader as homeLoader } from "./pages/Home";
import RecoveryEmailSend, {
  action as recoveryEmailSendAction,
} from "./components/RecoveryEmailSend";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route
        path="/"
        element={<Home />}
        loader={homeLoader}
        errorElement={<ErrorMessage />}
      />
      <Route
        path="/register"
        element={<Register />}
        action={registerAction}
        errorElement={<ErrorMessage />}
      />
      <Route
        path="/login"
        element={<Login />}
        action={loginAction}
        errorElement={<ErrorMessage />}
      />
      <Route
        path="/recovery-email-send"
        element={<RecoveryEmailSend />}
        action={recoveryEmailSendAction}
        errorElement={<ErrorMessage />}
      />
      <Route
        path="/recovery"
        element={<PasswordRecovery />}
        // action={loginAction}
        errorElement={<ErrorMessage />}
      />
      <Route
        path="/reset-password"
        element={<ResetPassword />}
        // loader={resetPasswordLoader}
        action={resetPasswordAction}
        errorElement={<ErrorMessage />}
      />
    </>
  )
);

function App() {
  axios.defaults.baseURL = "http://localhost:8800/api";
  axios.defaults.withCredentials = true;

  return <RouterProvider router={router}></RouterProvider>;
}

export default App;
