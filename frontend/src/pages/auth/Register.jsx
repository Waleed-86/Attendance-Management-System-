import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { authApi } from "../../api/auth";

export default function Register() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const password = watch("password");

  const onSubmit = async (data) => {
    setServerError("");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("phone", data.phone);
      formData.append("password", data.password);
      formData.append("password_confirmation", data.password_confirmation);
      if (data.profile_picture?.[0]) {
        formData.append("profile_picture", data.profile_picture[0]);
      }

      const res = await authApi.register(formData);
      const { token, user } = res.data.data;
      login(token, user);
      showToast("Account created successfully!");
      navigate("/dashboard");
    } catch (err) {
      if (err.response?.status === 422) {
        const firstError = Object.values(err.response.data.errors || {})[0];
        setServerError(firstError?.[0] || "Please check the form and try again.");
      } else {
        setServerError(
          err.response?.data?.message || "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Get started with attendance tracking."
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        encType="multipart/form-data"
      >
        {serverError && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-3.5 py-2.5 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <Input
          label="Full name"
          placeholder="Jane Doe"
          error={errors.name?.message}
          {...register("name", {
            required: "Full name is required",
            minLength: { value: 2, message: "Name is too short" },
          })}
        />

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
          label="Phone number"
          type="tel"
          placeholder="+92 300 1234567"
          error={errors.phone?.message}
          {...register("phone", {
            required: "Phone number is required",
            pattern: {
              value: /^[0-9+\-\s()]{7,20}$/,
              message: "Enter a valid phone number",
            },
          })}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink-800">
            Profile picture (optional)
          </label>
          <input
            type="file"
            accept="image/*"
            className="text-sm text-ink-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3.5 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100"
            {...register("profile_picture")}
          />
        </div>

        <Input
          label="Password"
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
          label="Confirm password"
          type="password"
          placeholder="Re-enter your password"
          error={errors.password_confirmation?.message}
          {...register("password_confirmation", {
            required: "Please confirm your password",
            validate: (value) =>
              value === password || "Passwords do not match",
          })}
        />

        <Button type="submit" loading={loading} className="w-full mt-1">
          Create account
        </Button>

        <p className="text-center text-sm text-ink-600 mt-2">
          Already have an account?{" "}
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