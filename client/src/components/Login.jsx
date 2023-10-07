import { Form, Link, useActionData } from "react-router-dom";

export const action = async ({ request }) => {
  const data = await request.formData();
  console.log("data:", data);
  return null;
};

export default function Login() {
  const errorMessage = useActionData();

  return (
    <div className="container mx-auto">
      <div className="flex justify-center items-center h-screen">
        <div className="title flex flex-col items-center">
          <h4 className="text-5xl font-bold">Hello Again!</h4>
          <span className="py-4 text-xl w-2/3 text-center text-gray-500">
            {errorMessage}
          </span>

          <Form method="post" className="py-1" replace>
            <div className="profile flex justify-center py-4">
              <div className="text-box">
                <input
                  type="text"
                  name="username"
                  className="w-full my-2 p-2 rounded-md border border-gray-200 focus:border-blue-300 focus:outline-none "
                  placeholder="username"
                />
                <input
                  type="email"
                  name="email"
                  className="w-full my-2 p-2 rounded-md border border-gray-200 focus:border-blue-300 focus:outline-none "
                  placeholder="email"
                />
                <input
                  type="password"
                  name="password"
                  className="w-full my-2 p-2 rounded-md border border-gray-200 focus:border-blue-300 focus:outline-none "
                  placeholder="password"
                />
                <button
                  type="submit"
                  className="border border-gray-500 w-full p-2 text-xl text-gray-500 rounded-md"
                >
                  Submit
                </button>
              </div>
            </div>

            <div className="text-center py-4">
              <span className="text-gray-500">
                Not a Member?
                <Link to="/register" className="text-red-500 pl-1">
                  Register Now
                </Link>
              </span>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
