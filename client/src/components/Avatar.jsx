export default function Avatar({ userId, username }) {
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
  const choosenColor = `bg-${colors[colorNum]}-${colorNum}00`;

  return (
    <div className={"w-8 h-8 rounded-full flex items-center " + choosenColor}>
      <div className={`text-center w-full opacity-70`}>{username[0]}</div>
    </div>
  );
}
