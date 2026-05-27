"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";

import { isAcceptedImageType, MAX_IMAGES, MAX_IMAGE_BYTES } from "@/lib/kudos/compose-validation";

type Props = {
  images: string[]; // data URLs
  onAdd: (dataUrl: string) => void;
  onRemove: (index: number) => void;
};

export function ImageUploader({ images, onAdd, onRemove }: Props) {
  const t = useTranslations("kudos.compose");
  const inputRef = useRef<HTMLInputElement>(null);
  const atMax = images.length >= MAX_IMAGES;

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const remaining = MAX_IMAGES - images.length;
    Array.from(files)
      .slice(0, remaining)
      .forEach((file) => {
        if (!isAcceptedImageType(file.type)) return;
        if (file.size > MAX_IMAGE_BYTES) return; // skip oversized files (data-URL payload guard)
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result;
          if (typeof result === "string") onAdd(result);
        };
        reader.readAsDataURL(file);
      });
  }

  return (
    <div className="flex items-start gap-4">
      {/* Label */}
      <div className="flex shrink-0 items-center gap-0.5 pt-[26px]">
        <span className="font-['Montserrat'] text-[22px] font-bold leading-[28px] text-[#00101A]">
          {t("imageLabel")}
        </span>
      </div>

      {/* Thumbnails + add button */}
      <div className="flex flex-1 flex-wrap items-center gap-4">
        {/* Uploaded thumbnails */}
        {images.map((url, idx) => (
          <div
            key={idx}
            className="relative h-[80px] w-[80px] shrink-0 rounded-[18px] border border-[#998C5F] bg-white"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`Upload ${idx + 1}`}
              className="h-full w-full rounded-[4px] border border-[#FFEA9E] object-cover"
            />
            <button
              type="button"
              aria-label={`Remove image ${idx + 1}`}
              onClick={() => onRemove(idx)}
              className="absolute -right-[8px] -top-[8px] flex h-[20px] w-[20px] items-center justify-center rounded-full bg-[#D4271D] p-[1.5px] text-white shadow"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.5 3.5L3.5 10.5M3.5 3.5l7 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ))}

        {/* Add button — label/note stacked inside chip, matching design */}
        {!atMax && (
          <div className="flex flex-col items-center gap-0.5">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-0.5 rounded-[8px] border border-[#998C5F] bg-white px-3 py-[4px] hover:bg-[#FFF8E1]"
            >
              <span className="font-['Montserrat'] text-[14px] font-semibold text-[#00101A]">
                + {t("imageAdd")}
              </span>
              <span className="font-['Montserrat'] text-[11px] text-[#999]">{t("imageMax")}</span>
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg"
              multiple
              className="sr-only"
              onChange={(e) => handleFiles(e.target.files)}
              // Reset so the same file can be re-selected after removal
              onClick={(e) => {
                (e.target as HTMLInputElement).value = "";
              }}
            />
          </div>
        )}

        {atMax && (
          <span className="font-['Montserrat'] text-[12px] text-[#999]">{t("imageMax")}</span>
        )}
      </div>
    </div>
  );
}
