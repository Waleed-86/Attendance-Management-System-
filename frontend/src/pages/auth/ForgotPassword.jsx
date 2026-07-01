import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { MailCheck } from "lucide-react";
import AuthLayout from "../../layouts/AuthLayout";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { authApi } from "../../api/auth";

export default function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [sent, setSent] = useState(false);

  const onSubmit = async (data) => {
    setServerError("");
    setLoading(true);
    try {
      await authApi.forgotPassword(data);
      setSent(true);
    } catch (err) {
      setServerError(
        err.response?.data?.message ||
          "Unable to send reset link. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout title="Check your email">
        <div className="flex flex-col items-center text-center gap-3 py-4">
          <div className="h-12 w-12 rounded-full bg-brand-50 flex items-center justify-center">
            <MailCheck className="text-brand-600" size={22} />
          </div>
          <p className="text-sm text-ink-600">
            If an account exists with that email, we've sent a link to reset
            your password.
          </p>
          <Link
            to="/login"
            className="text-sm font-medium text-brand-600 hover:text-brand-700 mt-2"
          >
            Back to sign in
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset link."
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

        <Button type="submit" loading={loading} className="w-full mt-1">
          Send reset link
        </Button>

        <p className="text-center text-sm text-ink-600 mt-2">
          Remembered your password?{" "}
          <Link
            to="/login"
            className="font-medium text-brand-600 hover:text-brand-700"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}