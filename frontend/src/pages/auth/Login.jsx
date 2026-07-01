import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { authApi } from "../../api/auth";

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setServerError("");
    setLoading(true);
    try {
      const res = await authApi.login(data);
      const { token, user } = res.data.data;
      login(token, user);
      showToast(`Welcome back, ${user.name}!`);
      navigate(user.role === "admin" ? "/admin/dashboard" : "/dashboard");
    } catch (err) {
      setServerError(
        err.response?.data?.message ||
          "Unable to sign in. Check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Sign in to your account"
      subtitle="Enter your details to continue."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {serverError && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-3.5 py-2.5 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <Input
          label="Email address"
          type="email"
          placeholder="you@company.com"
          error={errors.email?.message}
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Enter a valid email address",
            },
          })}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters",
            },
          })}
        />

        <div className="flex justify-end -mt-1">
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" loading={loading} className="w-full mt-1">
          Sign in
        </Button>

        <p className="text-center text-sm text-ink-600 mt-2">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-brand-600 hover:text-brand-700"
          >
            Create one
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}