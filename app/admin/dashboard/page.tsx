import { getAllMedia } from "@/lib/media";
import AdminMediaGrid from "@/components/admin/AdminMediaGrid";
import LogoutButton from "@/components/admin/LogoutButton";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  let items: Awaited<ReturnType<typeof getAllMedia>> = [];
  try {
    items = await getAllMedia();
  } catch {
    items = [];
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      {/* Admin header */}
      <header className="border-b border-[#2a2a2a] bg-[#0d0d0d]/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-8">
              <Image src="/logos/tp-icon.png" alt="Trash Pandas" fill className="object-contain" />
            </div>
            <div>
              <span className="text-white font-semibold text-sm">Admin Dashboard</span>
              <span className="ml-2 text-[10px] font-medium bg-[#6B35A3]/30 text-[#c4a0e8] px-2 py-0.5 rounded-full">
                Trash Pandas 14U
              </span>
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">Media Gallery</h1>
            <p className="text-[#8a8a8a] text-sm mt-0.5">
              {items.length} item{items.length !== 1 ? "s" : ""} — hover a photo to delete
            </p>
          </div>
        </div>

        <AdminMediaGrid items={items} />
      </main>
    </div>
  );
}
