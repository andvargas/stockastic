import currencyRates from "./currencyRates";

const avgSL = 1.56;
const avgTP = 3.54;
const accRiskTrade = 100;

export const calculateTradeLevels = (entryPrice, atr, currency) => {
  if (!entryPrice || !atr) return {};

  const stopLoss = parseFloat((entryPrice - avgSL * atr).toFixed(4));
  const takeProfit = parseFloat((entryPrice + avgTP * atr).toFixed(4));

  const currencyRate = currencyRates[currency] || 1;
  const riskPerUnitGBP = avgSL * atr * currencyRate;
  const quantity = Math.floor(accRiskTrade / riskPerUnitGBP);

  return { stopLoss, takeProfit, quantity };
};