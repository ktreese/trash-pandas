import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { verifyAdminSession } from "@/lib/auth";
import LoginForm from "./LoginForm";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (token && (await verifyAdminSession(token))) {
    redirect("/admin/dashboard");
  }

  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
