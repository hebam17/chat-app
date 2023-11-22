import Register, { action as registerAction } from "./components/Register";
import axios from "axios";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import Login, {
  action as loginAction,
  loader as loginLoader,
} from "./components/Login";

import ErrorMessage from "./components/ErrorMessage";
import PasswordRecovery from "./components/PasswordRecovery";
import ResetPassword, {
  action as resetPasswordAction,
  // loader as resetPasswordLoader,
} from "./components/ResetPassword";
import RecoveryEmailSend, {
  action as recoveryEmailSendAction,
} from "./components/RecoveryEmailSend";
import Chat, { loader as chatLoader } from "./pages/Chat";
import AuthRequired, { AuthDenied } from "./components/AuthRequired";
import Layout from "./components/Layout";
import Contact from "./components/Contact";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<Layout />}>
        <Route element={<AuthRequired />}>
          <Route
            path="/"
            element={<Chat />}
            loader={chatLoader}
            errorElement={<ErrorMessage />}
          />
          <Route
            path="/contact/:username"
            element={<Contact />}
            // loader={chatLoader}
            errorElement={<ErrorMessage />}
          />
        </Route>
        <Route element={<AuthDenied />}>
          <Route
            path="/register"
            element={<Register />}
            action={registerAction}
            errorElement={<ErrorMessage />}
          />
          <Route
            path="/login"
            element={<Login />}
            loader={loginLoader}
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
            errorElement={<ErrorMessage />}
          />
          <Route
            path="/reset-password"
            element={<ResetPassword />}
            action={resetPasswordAction}
            errorElement={<ErrorMessage />}
          />
        </Route>
      </Route>
    </>
  )
);

function App() {
  axios.defaults.baseURL = "http://localhost:8800/api";
  axios.defaults.withCredentials = true;

  return <RouterProvider router={router}></RouterProvider>;
}

export default App;
