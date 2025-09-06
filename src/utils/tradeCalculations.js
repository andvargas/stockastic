const avgSL = 1.56;
const avgTP = 3.54;
const accRiskTrade = 100;

export const calculateTradeLevels = (entryPrice, atr, currency, currencyRates) => {
  if (!entryPrice || !atr) return {};

  // Normalize for GBX → GBP
  const normalize = currency === "GBX" ? 0.01 : 1;

  const stopLoss = parseFloat((entryPrice - avgSL * atr).toFixed(4));
  const takeProfit = parseFloat((entryPrice + avgTP * atr).toFixed(4));

  const currencyRate = currencyRates[currency] || 1;
  const riskPerUnitGBP = avgSL * atr * currencyRate * normalize;

  const quantity = Math.floor(accRiskTrade / riskPerUnitGBP);

  return { stopLoss, takeProfit, quantity };
};
