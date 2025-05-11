const RoundIconButton = ({ onClick, icon: Icon, color = "bg-gray-200" }) => {
  return (
    <button
      onClick={onClick}
      className={`${color} text-blue p-2 rounded-full shadow hover:opacity-80 transition`}
    >
      <Icon size={12} />
    </button>
  );
};

export default RoundIconButton;