import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const TradeForm = ({ onAddTrade }) => {
  const tradeSchema = Yup.object().shape({
    market: Yup.string().required("Market is required"),
    ticker: Yup.string().required("Ticker is required"),
    entryPrice: Yup.number().positive().required("Entry price is required"),
    quantity: Yup.number().positive().integer().required("Quantity is required"),
    date: Yup.string().required("Date is required"),
    stopLoss: Yup.number().nullable(),
    takeProfit: Yup.number().nullable(),
    type: Yup.string().oneOf(["Long", "Short"]).required("Type is required"),
    status: Yup.string().oneOf(["Open", "Closed"]).required("Status is required"),
    atr: Yup.number().nullable(),
  });

  return (
    <Formik
      initialValues={{
        market: "LON",
        ticker: "",
        entryPrice: "",
        quantity: "",
        date: new Date().toISOString().split("T")[0], // format 'YYYY-MM-DD'
        stopLoss: "",
        takeProfit: "",
        type: "Long",
        status: "Open",
        atr: "",
      }}
      validationSchema={tradeSchema}
      onSubmit={(values, { resetForm }) => {
        onAddTrade(values);
        resetForm();
      }}
    >
      {() => (
        <Form className="bg-white p-6 rounded-2xl shadow-lg max-w-md mx-auto space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Market</label>
              <Field as="select" name="market" className="border p-2 w-48">
                <option value="LON">LON</option>
                <option value="NYSE">NYSE</option>
                <option value="NASDAQ">NASDAQ</option>
              </Field>
              <ErrorMessage name="market" component="div" className="text-red-500 text-sm" />
            </div>
            <div>
              <label>Ticker</label>
              <Field name="ticker" className="border p-2 uppercase" />
              <ErrorMessage name="ticker" component="div" className="text-red-500 text-sm" />
            </div>
          </div>

          <div>
            <label>Purchase Date</label>
            <Field type="date" name="date" className="border p-2 w-full" />
            <ErrorMessage name="date" component="div" className="text-red-500 text-sm w-full" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="entryPrice">Entry Price</label>
              <Field type="number" name="entryPrice" className="border p-2" />
              <ErrorMessage name="entryPrice" component="div" className="text-red-500 text-sm" />
            </div>
            <div>
              <label>Quantity</label>
              <Field type="number" name="quantity" className="border p-2" />
              <ErrorMessage name="quantity" component="div" className="text-red-500 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Stop Loss</label>
              <Field type="number" name="stopLoss" className="border p-2" />
              <ErrorMessage name="stopLoss" component="div" className="text-red-500 text-sm" />
            </div>
            <div>
              <label>Take Profit</label>
              <Field type="number" name="takeProfit" className="border p-2" />
              <ErrorMessage name="takeProfit" component="div" className="text-red-500 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Type</label>
              <Field as="select" name="type" className="border p-2 w-48">
                <option value="Long">Long</option>
                <option value="Short">Short</option>
              </Field>
            </div>
            {/* <div> don't need this for now
              <label>Status</label>
              <Field as="select" name="status" className="border p-2 w-48">
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
              </Field>
            </div> */}
            <div>
              <label>ATR</label>
              <Field type="number" name="atr" className="border p-2" />
              <ErrorMessage name="takeProfit" component="div" className="text-red-500 text-sm" />
            </div>
          </div>

          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            Add Trade
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default TradeForm;