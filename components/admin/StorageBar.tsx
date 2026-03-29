import { HardDrive } from "lucide-react";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

interface Props {
  usedBytes: number;
  blobCount: number;
  limitGb?: number; // defaults to 1GB (Vercel Hobby plan)
}

export default function StorageBar({ usedBytes, blobCount, limitGb = 1 }: Props) {
  const limitBytes = limitGb * 1024 ** 3;
  const pct = Math.min((usedBytes / limitBytes) * 100, 100);

  const barColor =
    pct >= 90
      ? "bg-red-500"
      : pct >= 70
      ? "bg-yellow-500"
      : "bg-[#6B35A3]";

  const labelColor =
    pct >= 90
      ? "text-red-400"
      : pct >= 70
      ? "text-yellow-400"
      : "text-[#c4a0e8]";

  return (
    <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] px-5 py-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-[#8a8a8a]">
          <HardDrive size={15} />
          <span className="text-sm font-medium">Blob Storage</span>
        </div>
        <span className={`text-sm font-semibold tabular-nums ${labelColor}`}>
          {formatBytes(usedBytes)}{" "}
          <span className="text-[#555] font-normal">/ {limitGb} GB</span>
        </span>
      </div>

      {/* Track */}
      <div className="h-2 w-full rounded-full bg-[#2a2a2a] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct.toFixed(2)}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-2">
        <span className="text-[#555] text-xs">{pct.toFixed(1)}% used</span>
        <span className="text-[#555] text-xs">{blobCount} files</span>
      </div>
    </div>
  );
}
