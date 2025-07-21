import React, { useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import currencyRates from "../utils/currencyRates";

const avgSL = 1.56;
const avgTP = 3.54;
const accRiskTrade = 100;

const tradeSchema = Yup.object().shape({
  market: Yup.string().required("Market is required"),
  ticker: Yup.string().required("Ticker is required"),
  entryPrice: Yup.number().positive().required("Entry price is required"),
  quantity: Yup.number().positive().integer().required("Quantity is required"),
  date: Yup.date().required("Date is required"),
  stopLoss: Yup.number().nullable(),
  takeProfit: Yup.number().nullable(),
  type: Yup.string().oneOf(["Long", "Short"]).required("Type is required"),
  assetType: Yup.string().oneOf(["Paper Money", "Real Money", "CFD", "Paper CFD"]).required("Asset type is required"),
  status: Yup.string().oneOf(["Open", "Closed", "Considering"]).required("Status is required"),
  atr: Yup.number().nullable(),
  strategy: Yup.string().required("Strategy is required"),
});

const TradeForm = ({ onAddTrade, onClose }) => {
  const calculateTradeLevels = (setFieldValue, values, field, value) => {
    const atrValue = field === "atr" ? parseFloat(value) : parseFloat(values.atr);
    const entryPriceValue = field === "entryPrice" ? parseFloat(value) : parseFloat(values.entryPrice);

    if (!isNaN(atrValue) && !isNaN(entryPriceValue)) {
      const stopLoss = (entryPriceValue - avgSL * atrValue).toFixed(4);
      const takeProfit = (entryPriceValue + avgTP * atrValue).toFixed(4);

      setFieldValue("stopLoss", stopLoss);
      setFieldValue("takeProfit", takeProfit);
    }
    if (!isNaN(atrValue)) {
      const currencyRate = currencyRates[values.currency] || 1;
      const riskPerUnitGBP = avgSL * atrValue * currencyRate;
      const quantity = Math.floor(accRiskTrade / riskPerUnitGBP);
      setFieldValue("quantity", quantity);
    }
  };

  return (
    <Formik
      initialValues={{
        market: "LON",
        currency: "GBX",
        ticker: "",
        entryPrice: "",
        quantity: "",
        date: new Date().toISOString().split("T")[0],
        stopLoss: "",
        takeProfit: "",
        type: "Long",
        assetType: "Real Money",
        status: "Open",
        atr: "",
        overnightInterest: "",
        strategy: "2.2",
      }}
      validationSchema={tradeSchema}
      onSubmit={async (values, { resetForm }) => {
        const success = await onAddTrade(values);
        if (success) {
          resetForm();
          onClose();
        }
      }}
    >
      {({ setFieldValue, values }) => {
        useEffect(() => {
          if (values.market === "LON") {
            setFieldValue("currency", "GBX");
          } else if (["NASDAQ", "NYSE"].includes(values.market)) {
            setFieldValue("currency", "USD");
          } else if (["ETR", "EPA", "WBAG"].includes(values.market)) {
            setFieldValue("currency", "EUR");
          }
        }, [values.market, setFieldValue]);

        return (
          <Form className="bg-white p-6 rounded-2xl shadow-lg max-w-md mx-auto space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label>Market</label>
                <Field as="select" name="market" className="border p-2 w-full">
                  <option value="LON">LON</option>
                  <option value="NYSE">NYSE</option>
                  <option value="NASDAQ">NASDAQ</option>
                  <option value="ETR">XETRA (ETR)</option>
                  <option value="EPA">Euronext Paris (EPA)</option>
                  <option value="WBAG">Wiener Börse (WBAG)</option>
                </Field>
                <ErrorMessage name="market" component="div" className="text-red-500 text-sm" />
              </div>
              <div>
                <label>Ticker</label>
                <Field
                  name="ticker"
                  className="border p-2 uppercase w-full"
                  onChange={(e) => setFieldValue("ticker", e.target.value.toUpperCase())}
                />
                <ErrorMessage name="ticker" component="div" className="text-red-500 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label>Transaction Type</label>
                <Field as="select" name="type" className="border p-2 w-full">
                  <option value="Long">Long</option>
                  <option value="Short">Short</option>
                </Field>
              </div>
              <div>
                <label>Asset Type</label>
                <Field as="select" name="assetType" className="border p-2 w-full">
                  <option value="Paper Money">Paper Money</option>
                  <option value="Real Money">Real Money</option>
                  <option value="CFD">CFD</option>
                  <option value="Paper CFD">Paper CFD</option>
                </Field>
              </div>
              <div>
                <label>ATR</label>
                <Field
                  type="number"
                  name="atr"
                  className="border p-2 w-full"
                  onChange={(e) => {
                    const value = e.target.value;
                    setFieldValue("atr", value);
                    calculateTradeLevels(setFieldValue, values, "atr", value);
                  }}
                />
                <ErrorMessage name="atr" component="div" className="text-red-500 text-sm" />
              </div>
              <div>
                <label>Strategy</label>
                <Field as="select" name="strategy" className="border p-2 w-full">
                  <option value="4.2">1.0</option>
                  <option value="2.2">2.2</option>
                  <option value="3.1">3.1</option>
                  <option value="3.2">3.2</option>
                  <option value="4.1">4.0</option>
                </Field>
                <ErrorMessage name="strategy" component="div" className="text-red-500 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label>Purchase Date</label>
                <Field type="date" name="date" className="border p-2 w-full" />
                <ErrorMessage name="date" component="div" className="text-red-500 text-sm" />
              </div>
              <div>
                <label>Overnight Interest</label>
                <Field type="number" name="overnightInterest" className="border p-2 w-full" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label>Entry Price</label>
                <Field
                  type="number"
                  name="entryPrice"
                  className="border p-2 w-full"
                  onChange={(e) => {
                    const value = e.target.value;
                    setFieldValue("entryPrice", value);
                    calculateTradeLevels(setFieldValue, values, "entryPrice", value);
                  }}
                />
                <ErrorMessage name="entryPrice" component="div" className="text-red-500 text-sm" />
              </div>
              <div>
                <label>Quantity</label>
                <Field type="number" name="quantity" className="border p-2 w-full" />
                <ErrorMessage name="quantity" component="div" className="text-red-500 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label>Stop Loss</label>
                <Field type="number" name="stopLoss" className="border p-2 w-full" />
              </div>
              <div>
                <label>Take Profit</label>
                <Field type="number" name="takeProfit" className="border p-2 w-full" />
              </div>
            </div>
            <div>
              <Field name="status">
                {({ field, form }) => (
                  <label className="flex items-center gap-2 mt-4">
                    <input
                      type="checkbox"
                      checked={field.value === "Considering"}
                      onChange={() => form.setFieldValue("status", field.value === "Considering" ? "Open" : "Considering")}
                      className="accent-cyan-700"
                    />
                    Mark as Considering
                  </label>
                )}
              </Field>
            </div>

            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full">
              Add Trade
            </button>
          </Form>
        );
      }}
    </Formik>
  );
};

export default TradeForm;