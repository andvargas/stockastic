import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const TradeForm = () => {
  const tradeSchema = Yup.object().shape({
    ticker: Yup.string().required('Ticker is required'),
    entryPrice: Yup.number().positive().required('Entry price is required'),
    quantity: Yup.number().positive().integer().required('Quantity is required'),
  });

  return (
    <Formik
      initialValues={{ ticker: '', entryPrice: '', quantity: '' }}
      validationSchema={tradeSchema}
      onSubmit={(values, { resetForm }) => {
        console.log(values);
        resetForm()
        
        // axios.post('/api/trades', values) etc.
      }}
    >
      {() => (
        <Form className="bg-white p-12 m-6 rounded-2xl shadow-lg max-w-md mx-auto space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Add New Trade</h2>
          <div>
          <label htmlFor="ticker" className="block text-gray-600 mb-1">Ticker</label>
          <Field
              name="ticker"
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 uppercase"
              placeholder="AAPL"
            />
            <ErrorMessage
              name="ticker"
              component="div"
              className="text-red-500 text-sm mt-1"
            />
          </div>

          <div>
            <label htmlFor="entryPrice" className="block text-gray-600 mb-1">
              Entry Price (£)
            </label>
            <Field
              name="entryPrice"
              type="number"
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              placeholder="135.50"
            />
            <ErrorMessage
              name="entryPrice"
              component="div"
              className="text-red-500 text-sm mt-1"
            />
          </div>

          <div>
            <label htmlFor="quantity" className="block text-gray-600 mb-1">
              Quantity
            </label>
            <Field
              name="quantity"
              type="number"
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              placeholder="10"
            />
            <ErrorMessage
              name="quantity"
              component="div"
              className="text-red-500 text-sm mt-1"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
          >
            Add Trade
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default TradeForm;