import React from "react";
import Modal from "../components/Modal";
import api from "../services/api";
import dayjs from "dayjs";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const CloseTradeForm = ({ isOpen, onClose, trade, onSuccess }) => {
  const initialValues = {
    closePrice: "",
    closeDate: dayjs().format("YYYY-MM-DD"),
    pnl: "",
  };

  const validationSchema = Yup.object({
    closePrice: Yup.number().typeError("Close price must be a number").positive("Close price must be positive").required("Close price is required"),
    closeDate: Yup.date().required("Close date is required"),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Convert the date string to a Date object or ISO string
      const closeDate = new Date(values.closeDate).toISOString();

      await api.post("/trades/close-trade", {
        tradeId: trade._id,
        closePrice: parseFloat(values.closePrice),
        closeDate: closeDate, // Send the standardized date
        pnl: values.pnl !== "" ? parseFloat(values.pnl) : "",
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error closing trade:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Close Trade: ${trade.ticker}`}>
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ isSubmitting }) => (
          <Form className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Close Price</label>
              <Field type="number" step="0.01" name="closePrice" className="w-full border rounded p-2" />
              <ErrorMessage name="closePrice" component="div" className="text-red-500 text-sm" />
            </div>

            <div>
              <label className="block text-sm mb-1">Close Date</label>
              <Field type="date" name="closeDate" className="w-full border rounded p-2" />
              <ErrorMessage name="closeDate" component="div" className="text-red-500 text-sm" />
            </div>

            <div>
              <label className="block text-sm mb-1">Gross Profit (optional)</label>
              <Field
                type="number"
                step="0.01"
                name="pnl"
                placeholder="Add gross profit or leave empty to calculate"
                className="w-full border rounded p-2"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2 border rounded">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded">
                {isSubmitting ? "Closing..." : "Close Trade"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default CloseTradeForm;