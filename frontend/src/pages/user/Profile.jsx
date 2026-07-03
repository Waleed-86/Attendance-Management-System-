import { useState } from "react";
import { useForm } from "react-hook-form";
import { Camera, Save, KeyRound } from "lucide-react";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { profileApi } from "../../api/profile";

export default function Profile() {
  const { user, login } = useAuth();
  const { showToast } = useToast();

  const [preview, setPreview] = useState(user?.profile_picture || null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    watch,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm();
  const newPassword = watch("new_password");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const onProfileSubmit = async (data) => {
    setSavingProfile(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("phone", data.phone);
      if (selectedFile) formData.append("profile_picture", selectedFile);

      const res = await profileApi.update(formData);
      const updatedUser = res.data.data;

      // Refresh auth context with new user data (keep existing token)
      const token = localStorage.getItem("ams_token");
      login(token, updatedUser);

      showToast("Profile updated successfully.");
      setSelectedFile(null);
    } catch (err) {
      showToast(
        err.response?.data?.message ||
          Object.values(err.response?.data?.errors || {})[0]?.[0] ||
          "Unable to update profile.",
        "error"
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    setSavingPassword(true);
    try {
      await profileApi.changePassword(data);
      showToast("Password changed successfully.");
      resetPasswordForm();
    } catch (err) {
      showToast(
        err.response?.data?.message ||
          Object.values(err.response?.data?.errors || {})[0]?.[0] ||
          "Unable to change password.",
        "error"
      );
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-ink-900">Profile</h1>
      <p className="mt-1 text-sm text-ink-600">
        Manage your personal information and account security.
      </p>

      <Card className="mt-5">
        <h3 className="font-display font-semibold text-ink-900">
          Personal information
        </h3>

        <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="mt-4 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold text-xl overflow-hidden">
                {preview ? (
                  <img src={preview} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  user?.name?.charAt(0).toUpperCase()
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-brand-600 text-white flex items-center justify-center cursor-pointer hover:bg-brand-700">
                <Camera size={12} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <p className="text-sm font-medium text-ink-800">Profile picture</p>
              <p className="text-xs text-ink-400">JPG or PNG, max 2MB.</p>
            </div>
          </div>

          <Input
            label="Full name"
            error={profileErrors.name?.message}
            {...registerProfile("name", {
              required: "Full name is required",
              minLength: { value: 2, message: "Name is too short" },
            })}
          />

          <Input
            label="Email address"
            type="email"
            error={profileErrors.email?.message}
            {...registerProfile("email", {
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
            error={profileErrors.phone?.message}
            {...registerProfile("phone", {
              required: "Phone number is required",
              pattern: {
                value: /^[0-9+\-\s()]{7,20}$/,
                message: "Enter a valid phone number",
              },
            })}
          />

          <Button type="submit" loading={savingProfile} className="self-start">
            <Save size={16} />
            Save changes
          </Button>
        </form>
      </Card>

      <Card className="mt-5">
        <h3 className="font-display font-semibold text-ink-900 flex items-center gap-1.5">
          <KeyRound size={16} />
          Change password
        </h3>

        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="mt-4 flex flex-col gap-4">
          <Input
            label="Current password"
            type="password"
            error={passwordErrors.current_password?.message}
            {...registerPassword("current_password", {
              required: "Current password is required",
            })}
          />

          <Input
            label="New password"
            type="password"
            placeholder="At least 8 characters"
            error={passwordErrors.new_password?.message}
            {...registerPassword("new_password", {
              required: "New password is required",
              minLength: { value: 8, message: "Password must be at least 8 characters" },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: "Use upper, lower case letters and a number",
              },
            })}
          />

          <Input
            label="Confirm new password"
            type="password"
            error={passwordErrors.new_password_confirmation?.message}
            {...registerPassword("new_password_confirmation", {
              required: "Please confirm your new password",
              validate: (value) => value === newPassword || "Passwords do not match",
            })}
          />

          <Button type="submit" loading={savingPassword} className="self-start">
            Change password
          </Button>
        </form>
      </Card>
    </div>
  );
}