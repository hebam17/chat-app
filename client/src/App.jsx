import Register, { action as registerAction } from "./pages/Register";
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
} from "./pages/Login";

import ErrorMessage from "./components/ErrorMessage";
import PasswordRecovery from "./components/PasswordRecovery";
import ResetPassword, {
  action as resetPasswordAction,
} from "./components/ResetPassword";
import RecoveryEmailSend, {
  action as recoveryEmailSendAction,
} from "./components/RecoveryEmailSend";
import Chat, { loader as chatLoader } from "./pages/Chat";
import AuthRequired, { AuthDenied } from "./components/AuthRequired";
import Contact from "./components/Contact";
import Home from "./pages/Home";
import { UserContext } from "./context/UserContext";
import { useContext } from "react";
import PageNotFound from "./pages/PageNotFound";

function App() {
  const userContextData = useContext(UserContext);

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route errorElement={<ErrorMessage />}>
        <Route path="/" element={<Home />} errorElement={<ErrorMessage />} />

        <Route element={<AuthRequired />}>
          <Route
            path="/chat"
            element={<Chat />}
            loader={chatLoader(userContextData)}
            errorElement={<ErrorMessage />}
          />
          <Route
            path="/contact/:username"
            element={<Contact />}
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
            action={loginAction(userContextData)}
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
        <Route path="*" element={<PageNotFound />} />
      </Route>
    )
  );
  axios.defaults.baseURL = "http://localhost:8800/api";
  axios.defaults.withCredentials = true;

  return <RouterProvider router={router}></RouterProvider>;
}

export default App;
