import { useLoaderData } from "react-router-dom";

export const loader = ({ request }) => {
  return new URL(request.url).searchParams.get("message");
};

export default function Home() {
  const message = useLoaderData();

  return (
    <>
      {message && alert(message)}
      <h1>Home page</h1>
    </>
  );
}

// 4:01h
