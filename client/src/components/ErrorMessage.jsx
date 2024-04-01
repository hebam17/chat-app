import { useRouteError } from "react-router-dom";
import Logo from "./Logo";

export default function ErrorMessage() {
  const error = useRouteError();

  return (
    <div className="p-4 h-screen overflow-hidden chat">
      <nav className="text-left">
        <Logo color="white" />
      </nav>
      <div className="h-full flex flex-col justify-center items-center">
        <div className="font-bold text-lg">
          Sorry, an error occurred, Refreash or back again later
        </div>
      </div>
    </div>
  );
}
