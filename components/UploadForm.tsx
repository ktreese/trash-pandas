"use client";

import { useState, useEffect, useRef, useCallback, type ChangeEvent, type DragEvent } from "react";
import Image from "next/image";
import { Camera, Video, X, Upload, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

type UploadState = "idle" | "uploading" | "success" | "error";

interface Preview {
  url: string;
  type: string;
  file: File;
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [caption, setCaption] = useState("");
  const [uploaderName, setUploaderName] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("tp_uploader_name") ?? "";
    }
    return "";
  });
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    localStorage.setItem("tp_uploader_name", uploaderName);
  }, [uploaderName]);

  const ACCEPTED = "image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime,video/webm";
  const MAX_SIZE = 500 * 1024 * 1024; // 500 MB

  const addFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files);
    const valid = arr.filter((f) => {
      if (f.size > MAX_SIZE) {
        alert(`${f.name} is too large (max 500 MB).`);
        return false;
      }
      return true;
    });
    const newPreviews: Preview[] = valid.map((f) => ({
      url: URL.createObjectURL(f),
      type: f.type,
      file: f,
    }));
    setPreviews((p) => [...p, ...newPreviews]);
  }, []);

  const removePreview = (i: number) => {
    setPreviews((p) => {
      URL.revokeObjectURL(p[i].url);
      return p.filter((_, idx) => idx !== i);
    });
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addFiles(e.target.files);
    e.target.value = "";
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const handleSubmit = async () => {
    if (!previews.length) return;
    setState("uploading");
    setProgress(0);
    setErrorMsg("");

    try {
      for (let i = 0; i < previews.length; i++) {
        const { file } = previews[i];
        const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

        // Stream file directly to our Edge API route — no CORS issues, no size limit.
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: {
            "Content-Type": file.type,
            "x-filename": encodeURIComponent(filename),
            "x-caption": encodeURIComponent(caption.trim()),
            "x-uploader": encodeURIComponent(uploaderName.trim()),
            "x-size": String(file.size),
          },
          body: file,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Upload failed" }));
          throw new Error(err.error ?? "Upload failed");
        }

        setProgress(Math.round(((i + 1) / previews.length) * 100));
      }

      setState("success");
      // Clean up previews
      previews.forEach((p) => URL.revokeObjectURL(p.url));
      setPreviews([]);
      setCaption("");
      setTimeout(() => router.push("/"), 2000);
    } catch (err) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : "Upload failed. Please try again.");
      setState("error");
    }
  };

  if (state === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-4 animate-fade-in">
        <CheckCircle size={56} className="text-[#6B35A3]" />
        <h2 className="text-2xl font-bold text-white">Uploaded!</h2>
        <p className="text-[#8a8a8a]">Your photo{previews.length !== 1 ? "s" : ""} are now in the gallery.</p>
        <p className="text-[#8a8a8a] text-sm">Redirecting you back…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#2a2a2a] bg-[#1a1a1a] px-6 py-12 text-center transition-all cursor-pointer ${
          dragging ? "drop-zone-active" : "hover:border-[#6B35A3] hover:bg-[#1f1a2a]"
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          multiple
          capture="environment"
          className="hidden"
          onChange={onFileChange}
        />
        <div className="flex gap-4 mb-4">
          <div className="p-3 rounded-xl bg-[#6B35A3]/20">
            <Camera size={28} className="text-[#c4a0e8]" />
          </div>
          <div className="p-3 rounded-xl bg-[#6B35A3]/20">
            <Video size={28} className="text-[#c4a0e8]" />
          </div>
        </div>
        <p className="text-white font-semibold text-lg">
          Tap to choose photos or videos
        </p>
        <p className="text-[#8a8a8a] text-sm mt-1">or drag and drop here</p>
        <p className="text-[#8a8a8a] text-xs mt-3">
          JPG, PNG, GIF, WebP, MP4, MOV, WebM &mdash; up to 500 MB each
        </p>
      </div>

      {/* Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {previews.map((p, i) => (
            <div key={i} className="relative rounded-xl overflow-hidden bg-[#1a1a1a] border border-[#2a2a2a] aspect-square">
              {p.type.startsWith("video/") ? (
                <video
                  src={p.url}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                />
              ) : (
                <Image src={p.url} alt="" fill className="object-cover" />
              )}
              <button
                onClick={() => removePreview(i)}
                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 hover:bg-black text-white transition-colors"
              >
                <X size={14} />
              </button>
              <div className="absolute bottom-1.5 left-1.5 text-[10px] text-white/70 bg-black/50 rounded px-1.5 py-0.5">
                {formatBytes(p.file.size)}
              </div>
            </div>
          ))}
          <button
            onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-[#2a2a2a] hover:border-[#6B35A3] flex items-center justify-center text-[#8a8a8a] hover:text-[#c4a0e8] transition-all"
          >
            <span className="text-2xl leading-none">+</span>
          </button>
        </div>
      )}

      {/* Optional fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#b8b8b8] mb-1.5">
            Your Name <span className="text-[#8a8a8a] font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={uploaderName}
            onChange={(e) => setUploaderName(e.target.value)}
            placeholder="e.g. Jake's Mom"
            maxLength={60}
            className="w-full rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-3 text-white placeholder-[#555] focus:border-[#6B35A3] focus:outline-none focus:ring-1 focus:ring-[#6B35A3] transition-colors text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#b8b8b8] mb-1.5">
            Caption <span className="text-[#8a8a8a] font-normal">(optional)</span>
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="What's the moment? e.g. Game-winning hit vs. Cardinals"
            maxLength={200}
            rows={3}
            className="w-full rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-3 text-white placeholder-[#555] focus:border-[#6B35A3] focus:outline-none focus:ring-1 focus:ring-[#6B35A3] transition-colors text-sm resize-none"
          />
        </div>
      </div>

      {/* Error */}
      {state === "error" && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
          <AlertCircle size={18} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-red-300 text-sm">{errorMsg}</p>
        </div>
      )}

      {/* Upload button */}
      <button
        onClick={handleSubmit}
        disabled={!previews.length || state === "uploading"}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#6B35A3] hover:bg-[#8B45C8] disabled:opacity-40 disabled:cursor-not-allowed px-6 py-4 font-semibold text-white transition-all shadow-[0_0_25px_rgba(107,53,163,0.4)] hover:shadow-[0_0_35px_rgba(139,69,200,0.5)] text-base"
      >
        {state === "uploading" ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Uploading… {progress}%
          </>
        ) : (
          <>
            <Upload size={20} />
            {previews.length > 1 ? `Upload ${previews.length} Files` : "Upload to Gallery"}
          </>
        )}
      </button>

      {/* Progress bar */}
      {state === "uploading" && (
        <div className="h-1.5 w-full rounded-full bg-[#2a2a2a] overflow-hidden">
          <div
            className="h-full bg-[#6B35A3] transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
