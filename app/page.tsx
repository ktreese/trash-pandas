import Image from "next/image";
import Link from "next/link";
import { Camera } from "lucide-react";
import MediaGrid from "@/components/MediaGrid";
import { getAllMedia } from "@/lib/media";
import type { MediaItem } from "@/lib/types";

export const revalidate = 30; // ISR — revalidate every 30s

async function fetchMedia(): Promise<MediaItem[]> {
  try {
    return await getAllMedia();
  } catch {
    // DB not configured yet — return empty array during local dev setup
    return [];
  }
}

export default async function HomePage() {
  const items = await fetchMedia();

  return (
    <div>
      {/* Hero banner */}
      <section className="relative overflow-hidden border-b border-[#2a2a2a]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a2e] via-[#0d0d0d] to-[#0d0d0d]" />
        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 0,transparent 50%),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 0,transparent 50%)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 flex flex-col sm:flex-row items-center gap-8">
          <div className="relative shrink-0 w-36 h-36 sm:w-48 sm:h-48 rounded-2xl bg-[#6B35A3] overflow-hidden shadow-[0_0_40px_rgba(107,53,163,0.6)]">
            <Image
              src="/logos/batter.png"
              alt="Trash Pandas batter"
              fill
              className="object-contain mix-blend-multiply scale-110"
              priority
            />
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
              Trash Pandas
            </h1>
            <p className="text-[#c4a0e8] text-xl font-semibold mt-1">14U Baseball</p>
            <p className="text-[#8a8a8a] mt-3 max-w-lg text-sm sm:text-base">
              Relive the moments — photos and videos from the field, the dugout, and everything in between.
            </p>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 mt-6 rounded-xl bg-[#6B35A3] hover:bg-[#8B45C8] px-6 py-3 font-semibold text-white transition-all shadow-[0_0_25px_rgba(107,53,163,0.5)] hover:shadow-[0_0_35px_rgba(139,69,200,0.6)] text-sm sm:text-base"
            >
              <Camera size={18} />
              Share a Photo or Video
            </Link>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Team Gallery</h2>
            <p className="text-[#8a8a8a] text-sm mt-0.5">
              {items.length > 0 ? `${items.length} photo${items.length === 1 ? "" : "s & videos"}` : "Share the first one!"}
            </p>
          </div>
          <Link
            href="/upload"
            className="flex items-center gap-1.5 text-sm text-[#c4a0e8] hover:text-white transition-colors"
          >
            <Camera size={15} />
            Upload
          </Link>
        </div>

        <MediaGrid items={items} />
      </section>
    </div>
  );
}
