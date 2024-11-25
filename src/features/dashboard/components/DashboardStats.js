const DashboardStats = ({
  title,
  icon,
  value,
  description = "",
  colorIndex,
  onClick,
}) => {
  const COLORS = ["primary", "primary"];

  const getDescStyle = () => {
    if (!description) return ""; // Verifica si description es undefined o null
    if (description.includes("↗︎"))
      return "font-bold text-green-700 dark:text-green-300";
    else if (description.includes("↙"))
      return "font-bold text-rose-500 dark:text-red-400";
    else return "";
  };

  return (
    <div
      className="stats shadow flex flex-col items-center justify-center"
      onClick={onClick}
      style={{ cursor: "pointer" }}
    >
      <div className="stat text-center">
        <div
          className={`stat-figure dark:text-slate-300 text-${
            COLORS[colorIndex % 2]
          }`}
        >
          {icon}
        </div>
        <div className="stat-title dark:text-slate-300">{title}</div>
        <div
          className={`stat-value dark:text-slate-300 text-${
            COLORS[colorIndex % 2]
          }`}
        >
          {value}
        </div>
        <div className={"stat-desc " + getDescStyle()}>{description}</div>
      </div>
    </div>
  );
};

export default DashboardStats;
