import Avatar from "./Avatar";

export default function ContactUser({
  userId,
  selected,
  handleClick,
  username,
  online,
}) {
  return (
    <div
      key={userId}
      className={`flex items-center gap-2 border-b border-gray-100 mb-2 cursor-pointer ${
        selected && "bg-green-50"
      }`}
      onClick={() => handleClick(userId)}
    >
      {selected && <div className="p-1 bg-green-500 h-12 rounded-r-sm"></div>}
      <div className="flex gap-2 pl-4 items-center">
        <Avatar online={online} username={username} userId={userId} />
        <span className="text-gray-800">{username}</span>
      </div>
    </div>
  );
}
