import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cookies } from "next/headers";
import { verifyUploadSession } from "@/lib/auth";
import UploadForm from "@/components/UploadForm";
import TeamCodeForm from "@/components/TeamCodeForm";

export const metadata = {
  title: "Share Photos & Videos | Trash Pandas 14U",
  description: "Upload your game day photos and videos to the Trash Pandas gallery.",
};

export default async function UploadPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("upload_auth")?.value;
  const isAuthorized = token ? !!(await verifyUploadSession(token)) : false;

  // If not authorized, show the team code gate (no page chrome needed)
  if (!isAuthorized) {
    return <TeamCodeForm />;
  }

  return (
    <div className="mx-auto max-w-lg w-full px-4 sm:px-6 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-[#8a8a8a] hover:text-[#c4a0e8] transition-colors mb-8"
      >
        <ArrowLeft size={15} />
        Back to Gallery
      </Link>

      <div className="flex items-center gap-4 mb-8">
        <div className="relative h-14 w-14 shrink-0">
          <Image src="/logos/tp-icon.png" alt="Trash Pandas" fill className="object-contain" sizes="56px" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Share a Moment</h1>
          <p className="text-[#8a8a8a] text-sm mt-0.5">Upload photos and videos from the game</p>
        </div>
      </div>

      <UploadForm />
    </div>
  );
}
