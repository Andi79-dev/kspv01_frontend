"use client";

import { useAuthStore } from "@/store/authStore";

// Format date to Indonesian locale
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function ProfilePage() {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          View and manage your account information
        </p>
      </div>

      {/* Profile Card */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex flex-col items-center gap-4 md:flex-row">
          {/* Avatar */}
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <span className="text-3xl font-bold">
              {user.nama.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* User Info */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-xl font-semibold">{user.nama}</h2>
            <p className="text-muted-foreground">@{user.username}</p>
            <div className="mt-2 flex items-center justify-center gap-2 md:justify-start">
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                  user.status
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {user.status ? "Active" : "Inactive"}
              </span>
              <span className="text-sm text-muted-foreground">
                {user.nama_role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Details Card */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">Account Details</h3>
        <div className="space-y-4">
          <div className="flex justify-between border-b pb-4">
            <span className="text-muted-foreground">Username</span>
            <span className="font-medium">{user.username}</span>
          </div>
          <div className="flex justify-between border-b pb-4">
            <span className="text-muted-foreground">Full Name</span>
            <span className="font-medium">{user.nama}</span>
          </div>
          <div className="flex justify-between border-b pb-4">
            <span className="text-muted-foreground">Role</span>
            <span className="font-medium">{user.nama_role}</span>
          </div>
          <div className="flex justify-between border-b pb-4">
            <span className="text-muted-foreground">Status</span>
            <span
              className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                user.status
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {user.status ? "Active" : "Inactive"}
            </span>
          </div>
          <div className="flex justify-between border-b pb-4">
            <span className="text-muted-foreground">Created At</span>
            <span className="font-medium">{formatDate(user.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last Updated</span>
            <span className="font-medium">{formatDate(user.updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
