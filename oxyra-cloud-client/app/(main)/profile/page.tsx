"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import Loader from "@/components/ui/Loader";
import FormField from "@/components/ui/FormField";
import { User as UserIcon, Mail, Key } from "lucide-react";
import { useUser } from "@/context/UserContext";
import useFetch from "@/hooks/useFetch";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  old_password: z.string().min(6, "Old password required"),
  new_password: z.string().min(6, "New password required"),
  confirm_password: z.string().min(6, "Confirm password required"),
}).refine(data => data.new_password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

type ProfileFormValues = z.infer<typeof schema>;

export default function ProfilePage() {
  const { user, isLoading: userLoading, refetch: refetchUser } = useUser();
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue } = useForm<ProfileFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name || "",
      old_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  // Keep name in sync with context
  useState(() => {
    if (user?.name) setValue("name", user.name);
  });

  console.log("User data in profile page:", user);

  const {
    isLoading,
    error,
    refetch: updateUser
  } = useFetch({
    auto: false,
    url: "/api/user",
    method: "PATCH",
    onSuccess: () => {
      toast.success("Profile updated successfully");
      refetchUser();
      reset({ name: user?.name || "", old_password: "", new_password: "", confirm_password: "" });
    },
    onError: (err) => toast.error(err.message || "Failed to update profile"),
  });

  const onSubmit = async (values: ProfileFormValues) => {
    await updateUser({ payload: {
      name: values.name,
      old_password: values.old_password,
      new_password: values.new_password,
      confirm_password: values.confirm_password,
    }});
  };

  if (userLoading) return <Loader fullScreen />;
console.log(user?.name)
  return (
    <div className="max-w-xl mx-auto py-10 px-2 sm:px-0">
      <h1 className="text-2xl font-bold mb-6 text-center">Profile</h1>
      <div className="mb-8 p-4 rounded-xl border bg-background">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <UserIcon size={18} />
            <span className="font-medium">{user?.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail size={18} />
            <span className="text-muted-foreground">{user?.email}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            Joined: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "-"}
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-8">
        <div>
          <div className="font-semibold mb-2">Edit Profile</div>
          <div className="grid gap-3">
            <FormField
              id="name"
              label="Name"
              icon={<UserIcon size={15} />}
              placeholder="Your Name"
              register={register}
              errors={errors}
            />
            <FormField
              id="old_password"
              label="Old Password"
              icon={<Key size={15} />}
              placeholder="Old Password"
              register={register}
              errors={errors}
              isSecret
            />
            <FormField
              id="new_password"
              label="New Password"
              icon={<Key size={15} />}
              placeholder="New Password"
              register={register}
              errors={errors}
              isSecret
            />
            <FormField
              id="confirm_password"
              label="Confirm Password"
              icon={<Key size={15} />}
              placeholder="Confirm Password"
              register={register}
              errors={errors}
              isSecret
            />
          </div>
        </div>
        {error && <div className="text-red-500 text-center">{error}</div>}
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={isSubmitting || isLoading}>
            {(isSubmitting || isLoading) ? <Loader size={16} /> : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
