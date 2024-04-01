import { Link } from "react-router-dom";

export default function PageNotFound() {
  return (
    <div className="chat flex flex-col items-center justify-center h-screen lg:px-8 md:px-5 px-4 m-0 py-3 lg:gap-10 md:gap-8 gap-6">
      <h1 className="text-6xl text-white font-bold">404</h1>
      <p className="text-black font-semibold text-2xl">Page Not Found!</p>
      <Link
        to="/"
        className="bg-white p-2 rounded-lg font-semibold text-sky-500"
      >
        Back home
      </Link>
    </div>
  );
}
