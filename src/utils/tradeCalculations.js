const avgSL = 1.57;
const avgTP = 3.14;
const accRiskTrade = 100;

export const calculateTradeLevels = (entryPrice, atr, currency, currencyRates, tradeType = "Long") => {
  if (!entryPrice || !atr) return {};

  // Determine if it's a short position
  const isShort = tradeType.toLowerCase().includes("short");

  let stopLoss, takeProfit;

  if (isShort) {
    // For SHORT positions: SL is ABOVE entry, TP is BELOW entry
    stopLoss = parseFloat((entryPrice + avgSL * atr).toFixed(4));
    takeProfit = parseFloat((entryPrice - avgTP * atr).toFixed(4));
  } else {
    // For LONG positions: SL is BELOW entry, TP is ABOVE entry
    stopLoss = parseFloat((entryPrice - avgSL * atr).toFixed(4));
    takeProfit = parseFloat((entryPrice + avgTP * atr).toFixed(4));
  }

  const currencyRate = currencyRates[currency] || 1;
  const unitValueInGBP = 1 / currencyRate;
  const riskPerUnitOriginal = avgSL * atr;
  const riskPerUnitGBP = riskPerUnitOriginal * unitValueInGBP;
  const quantity = Math.floor(accRiskTrade / riskPerUnitGBP);

  return { stopLoss, takeProfit, quantity };
};
