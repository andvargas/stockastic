import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Yup validation schema
  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await login(values.email, values.password);
      toast.success("Login successful");
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("Invalid email or password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white m-10 p-10 rounded-full">
        <img src="/icons/icon-512.png" alt="Stockastic Logo" className="w-32 h-32 mb-2" />
      </div>

      <Formik initialValues={{ email: "", password: "" }} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ isSubmitting }) => (
          <Form className="bg-white p-6 rounded shadow space-y-4 w-80">
            <h2 className="text-2xl font-bold text-center">Login</h2>

            <div>
              <Field type="email" name="email" placeholder="Email" className="border p-2 w-full rounded" />
              <ErrorMessage name="email" component="div" className="text-red-600 text-sm mt-1" />
            </div>

            <div>
              <Field type="password" name="password" placeholder="Password" className="border p-2 w-full rounded" />
              <ErrorMessage name="password" component="div" className="text-red-600 text-sm mt-1" />
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-cyan-700 text-white p-2 rounded hover:bg-cyan-600 transition-colors">
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </Form>
        )}
      </Formik>

      <div className="mt-4 text-sm">
        Not registered for Stockastic?{" "}
        <Link to="/register" className="text-cyan-700 hover:underline">
          Register
        </Link>
      </div>
    </div>
  );
};

export default Login;
