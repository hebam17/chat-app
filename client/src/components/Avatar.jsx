export default function Avatar({ userId, username, online }) {
  const colors = [
    "indigo",
    "teal",
    "fuchsia",
    "red",
    "green",
    "blue",
    "yellow",
    "orange",
    "amber",
    "emerald",
  ];

  const idBase10 = Math.trunc(parseInt(userId, 16));
  const colorNum = idBase10 % colors.length;
  const choosenColor = `bg-${colors[colorNum]}-${
    colorNum === 0 ? 8 : colorNum
  }00`;

  return (
    <div
      className={`w-8 h-8 relative rounded-full flex items-center ${
        choosenColor || "bg-indigo-500"
      }`}
    >
      <div className={`text-center w-full opacity-70`}>{username[0]}</div>
      {online && (
        <div className="absolute w-3 h-3 bg-green-400 bottom-0 right-0 rounded-full border border-white"></div>
      )}
      {!online && (
        <div className="absolute w-3 h-3 bg-gray-400 bottom-0 right-0 rounded-full border border-white"></div>
      )}
    </div>
  );
}
