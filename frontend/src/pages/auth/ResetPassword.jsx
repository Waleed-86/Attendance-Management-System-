import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useToast } from "../../context/ToastContext";
import { authApi } from "../../api/auth";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: { email: email || "" } });
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const { showToast } = useToast();
  const navigate = useNavigate();
  const password = watch("password");

  const onSubmit = async (data) => {
    setServerError("");
    setLoading(true);
    try {
      await authApi.resetPassword({ ...data, token });
      showToast("Password reset successfully. Please sign in.");
      navigate("/login");
    } catch (err) {
      setServerError(
        err.response?.data?.message ||
          "This reset link is invalid or has expired."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout title="Invalid link">
        <div className="flex flex-col items-center text-center gap-3 py-4">
          <p className="text-sm text-ink-600">
            This password reset link is missing or invalid. Please request a
            new one.
          </p>
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-brand-600 hover:text-brand-700 mt-2"
          >
            Request new link
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Choose a new password for your account."
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
          disabled={!!email}
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
          label="New password"
          type="password"
          placeholder="At least 8 characters"
          error={errors.password?.message}
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters",
            },
            pattern: {
              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
              message: "Use upper, lower case letters and a number",
            },
          })}
        />

        <Input
          label="Confirm new password"
          type="password"
          placeholder="Re-enter your new password"
          error={errors.password_confirmation?.message}
          {...register("password_confirmation", {
            required: "Please confirm your password",
            validate: (value) =>
              value === password || "Passwords do not match",
          })}
        />

        <Button type="submit" loading={loading} className="w-full mt-1">
          Reset password
        </Button>
      </form>
    </AuthLayout>
  );
}