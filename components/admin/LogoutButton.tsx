"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-1.5 text-sm text-[#8a8a8a] hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-[#252525]"
    >
      <LogOut size={15} />
      Log out
    </button>
  );
}
