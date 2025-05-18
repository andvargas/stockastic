const RoundIconButton = ({ onClick, icon: Icon, color = "bg-gray-200", iconClassName = "w-6 h-6" }) => {
  return (
    <button onClick={onClick} className={`${color} text-blue p-2 rounded-full opacity-70 hover:opacity-100 shadow hover:opacity-100 transition`}>
      <Icon className={iconClassName} />
    </button>
  );
};

export default RoundIconButton;
