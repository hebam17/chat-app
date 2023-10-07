import { useRouteError } from "react-router-dom";

export default function ErrorMessage() {
  const error = useRouteError();
  console.log(error);
  return (
    <>
      <div>Error:{error.message}</div>
      <div>
        {error.status} - {error.statusText}
      </div>
    </>
  );
}
