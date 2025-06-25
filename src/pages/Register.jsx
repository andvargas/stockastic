import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const initialValues = {
    email: "",
    password: "",
  };

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Required"),
    password: Yup.string().min(6, "Minimum 6 characters").required("Required"),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await register(values.email, values.password);
      toast.success("Registration successful!");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cyan-600">
      <div className="bg-white m-10 p-10 rounded-full">
        <img src="/icons/icon-512.png" alt="Stockastic Logo" className="w-32 h-32 mb-2" />
      </div>
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ isSubmitting }) => (
          <Form className="bg-white p-6 rounded shadow space-y-6 w-80">
            <h2 className="text-2xl font-bold text-center">Register</h2>
            <div>
              <Field type="email" name="email" placeholder="Email" className="w-full p-2 border rounded" />
              <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
            </div>

            <div>
              <Field type="password" name="password" placeholder="Password" className="w-full p-2 border rounded" />
              <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-cyan-700 text-white py-2 rounded hover:bg-cyan-600">
              {isSubmitting ? "Registering…" : "Register"}
            </button>
          </Form>
        )}
      </Formik>
      <div className="mt-4 text-white">
        Already registered with Stockastic?{" "}
        <a href="/login" className="text-white hover:underline">
          Login
        </a>
      </div>
    </div>
  );
};

export default Register;
