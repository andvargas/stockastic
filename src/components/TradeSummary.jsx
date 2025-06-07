const TradeSummary = ({ trade }) => {
  if (!trade) return null;

  const currentValue = (trade.lastPrice ?? trade.entryPrice) * trade.quantity;

  return (
    <div id="trade-summary">
      <h2 className="text-lg font-semibold mb-4">Trade Summary</h2>
      <div className="p-4 border rounded bg-gray-50 shadow-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Quantity:</span>
          <span>{trade.quantity}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Entry Price:</span>
          <span>{trade.entryPrice}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Current Value:</span>
          <span>{currentValue}</span>
        </div>
      </div>
    </div>
  );
};

export default TradeSummary;