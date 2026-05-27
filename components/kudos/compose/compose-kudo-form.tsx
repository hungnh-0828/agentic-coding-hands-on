"use client";

import { useTranslations } from "next-intl";
import type { KudosPerson, KudosHashtag, CreateKudosInput } from "@/lib/kudos/types";

import { useComposeForm } from "./use-compose-form";
import { RecipientSelect } from "./recipient-select";
import { KudoEditor } from "./kudo-editor";
import { HashtagPicker } from "./hashtag-picker";
import { ImageUploader } from "./image-uploader";

type Props = {
  people?: KudosPerson[];
  hashtags?: KudosHashtag[];
  onSubmit?: (input: CreateKudosInput) => void;
  submitting?: boolean;
  onCancel: () => void;
};

export function ComposeKudoForm({
  people = [],
  hashtags = [],
  onSubmit,
  submitting = false,
  onCancel,
}: Props) {
  const t = useTranslations("kudos.compose");
  const {
    form,
    isValid,
    setReceiverId,
    setTitle,
    setContent,
    addHashtag,
    removeHashtag,
    addImage,
    removeImage,
    setAnonymous,
    setAnonymousName,
    toInput,
  } = useComposeForm();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || submitting) return;
    onSubmit?.(toInput());
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* Recipient */}
      <RecipientSelect
        people={people}
        value={form.receiverId}
        onChange={setReceiverId}
      />

      {/* Danh hiệu (title/award name) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-4">
          {/* Label */}
          <div className="flex shrink-0 items-center gap-0.5">
            <span className="font-['Montserrat'] text-[22px] font-bold leading-[28px] text-[#00101A]">
              {t("titleLabel")}
            </span>
            <span className="font-['NotoSansJP'] text-[16px] font-bold leading-[20px] text-[#CF1322]">*</span>
          </div>
          {/* Input */}
          <input
            type="text"
            value={form.title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("titlePlaceholder")}
            className="flex-1 rounded-[8px] border border-[#998C5F] bg-white px-6 py-4 font-['Montserrat'] text-[16px] font-bold leading-[24px] text-[#999] placeholder:text-[#999] outline-none focus:ring-1 focus:ring-[#998C5F]"
          />
        </div>
        {/* Two-line hint */}
        <p className="ml-auto font-['Montserrat'] text-[16px] font-bold leading-[24px] tracking-[0.15px] text-[#999]">
          {t("titleHint1")}
          <br />
          {t("titleHint2")}
        </p>
      </div>

      {/* Kudo content editor */}
      <KudoEditor value={form.content} onChange={setContent} />

      {/* Hashtag */}
      <HashtagPicker
        hashtags={hashtags}
        selected={form.hashtagSlugs}
        onAdd={addHashtag}
        onRemove={removeHashtag}
      />

      {/* Image upload */}
      <ImageUploader
        images={form.imageUrls}
        onAdd={addImage}
        onRemove={removeImage}
      />

      {/* Anonymous checkbox */}
      <div className="flex flex-col gap-3">
        <label className="flex cursor-pointer items-center gap-4">
          <span
            className={[
              "flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-[4px] border border-[#999] bg-white transition-colors",
              form.isAnonymous ? "bg-[#FFEA9E] border-[#998C5F]" : "",
            ].join(" ")}
          >
            <input
              type="checkbox"
              checked={form.isAnonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="sr-only"
            />
            {form.isAnonymous && (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 7l4 4 6-7" stroke="#00101A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
          <span className="font-['Montserrat'] text-[22px] font-bold leading-[28px] text-[#999]">
            {t("anonymousLabel")}
          </span>
        </label>

        {form.isAnonymous && (
          <input
            type="text"
            value={form.anonymousName}
            onChange={(e) => setAnonymousName(e.target.value)}
            placeholder={t("anonymousNamePlaceholder")}
            className="w-full rounded-[8px] border border-[#998C5F] bg-white px-6 py-4 font-['Montserrat'] text-[16px] font-bold leading-[24px] text-[#00101A] placeholder:text-[#999] outline-none focus:ring-1 focus:ring-[#998C5F]"
          />
        )}
      </div>

      {/* Footer actions */}
      <div className="flex items-center gap-6">
        {/* Hủy button */}
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 rounded-[4px] border border-[#998C5F] bg-[rgba(255,234,158,0.10)] px-10 py-4 font-['Montserrat'] text-[16px] font-bold leading-[24px] text-[#00101A] transition-colors hover:bg-[rgba(255,234,158,0.25)]"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {t("cancel")}
        </button>

        {/* Gửi button */}
        <button
          type="submit"
          disabled={!isValid || submitting}
          className="flex flex-1 items-center justify-center gap-2 rounded-[8px] bg-[#FFEA9E] px-4 py-4 font-['Montserrat'] text-[22px] font-bold leading-[28px] text-[#00101A] transition-opacity disabled:cursor-not-allowed disabled:opacity-40 hover:enabled:opacity-90"
        >
          {t("submit")}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </form>
  );
}
