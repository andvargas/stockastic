import { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import api from "@/services/api";
import { calculateTradeLevels } from "../utils/tradeCalculations";

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
  const [currencyRates, setCurrencyRates] = useState({});

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await api.get("/currency-rates/latest");
        setCurrencyRates(res.data.rates || {});
      } catch (err) {
        console.error("Failed to fetch currency rates", err);
      }
    };
    fetchRates();
  }, []);

  const handleFieldChange = (field, value, setFieldValue, values) => {
    setFieldValue(field, value);

    const entryPriceValue = field === "entryPrice" ? parseFloat(value) : parseFloat(values.entryPrice);
    const atrValue = field === "atr" ? parseFloat(value) : parseFloat(values.atr);
    const currency = values.currency;

    if (!isNaN(entryPriceValue) && !isNaN(atrValue) && currency) {
      const { stopLoss, takeProfit } = calculateTradeLevels(entryPriceValue, atrValue, currency, currencyRates);

      setFieldValue("stopLoss", stopLoss);
      setFieldValue("takeProfit", takeProfit);
    }
  };

  const getCurrency = (market, assetType) => {
    if (market === "LON") {
      // For CFD or Paper CFD, use GBP; otherwise use GBX
      return assetType === "CFD" || assetType === "Paper CFD" ? "GBP" : "GBX";
    } else if (["NASDAQ", "NYSE"].includes(market)) {
      return "USD";
    } else if (["ETR", "EPA", "XAMS", "WBAG"].includes(market)) {
      return "EUR";
    } else if (["SIX"].includes(market)) {
      return "CHF";
    }
    return "GBX"; // default fallback
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
        strategy: "2.3",
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
          const newCurrency = getCurrency(values.market, values.assetType);
          setFieldValue("currency", newCurrency);
        }, [values.market, values.assetType, setFieldValue]);

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
                  <option value="XAMS">Euronext Amsterdam (XAMS)</option>
                  <option value="WBAG">Wiener Börse (WBAG)</option>
                  <option value="SIX">SIX Swiss Exchange (SIX)</option>
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
                  onChange={(e) => handleFieldChange("atr", e.target.value, setFieldValue, values)}
                />
                <ErrorMessage name="atr" component="div" className="text-red-500 text-sm" />
              </div>
              <div>
                <label>Strategy</label>
                <Field as="select" name="strategy" className="border p-2 w-full">
                  <option value="none">none</option>
                  <option value="1.0">1.0</option>
                  <option value="2.1">2.1</option>
                  <option value="2.2">2.2</option>
                  <option value="2.3">2.3</option>
                  <option value="3.1">3.1</option>
                  <option value="3.2">3.2</option>
                  <option value="4.0">4.0</option>
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
                  onChange={(e) => handleFieldChange("entryPrice", e.target.value, setFieldValue, values)}
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