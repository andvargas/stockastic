const avgSL = 1.56;
const avgTP = 3.54;
const accRiskTrade = 100;

export const calculateTradeLevels = (entryPrice, atr, currency, currencyRates) => {
  if (!entryPrice || !atr) return {};

  const stopLoss = parseFloat((entryPrice - avgSL * atr).toFixed(4));
  const takeProfit = parseFloat((entryPrice + avgTP * atr).toFixed(4));

  const currencyRate = currencyRates[currency] || 1;

  const unitValueInGBP = 1 / currencyRate;

  const riskPerUnitOriginal = avgSL * atr;
  const riskPerUnitGBP = riskPerUnitOriginal * unitValueInGBP;

  const quantity = Math.floor(accRiskTrade / riskPerUnitGBP);

  return { stopLoss, takeProfit, quantity };
};
