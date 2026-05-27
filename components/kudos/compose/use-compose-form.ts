"use client";

import { useState, useCallback } from "react";
import type { CreateKudosInput } from "@/lib/kudos/types";
import { isComposeInputValid, MAX_HASHTAGS, MAX_IMAGES } from "@/lib/kudos/compose-validation";

export type ComposeFormState = {
  receiverId: string;
  title: string;
  content: string;
  hashtagSlugs: string[];
  imageUrls: string[];
  isAnonymous: boolean;
  anonymousName: string;
};

const INITIAL_STATE: ComposeFormState = {
  receiverId: "",
  title: "",
  content: "",
  hashtagSlugs: [],
  imageUrls: [],
  isAnonymous: false,
  anonymousName: "",
};

export function useComposeForm() {
  const [form, setForm] = useState<ComposeFormState>(INITIAL_STATE);

  // Shared rule with the server guard (DRY). Sender already excluded from the
  // recipient list, so no senderId check is needed here.
  const isValid = isComposeInputValid({
    receiverId: form.receiverId,
    title: form.title,
    content: form.content,
    hashtagSlugs: form.hashtagSlugs,
    imageUrls: form.imageUrls,
    isAnonymous: form.isAnonymous,
    anonymousName: null,
  });

  const setReceiverId = useCallback((id: string) => {
    setForm((f) => ({ ...f, receiverId: id }));
  }, []);

  const setTitle = useCallback((v: string) => {
    setForm((f) => ({ ...f, title: v }));
  }, []);

  const setContent = useCallback((v: string) => {
    setForm((f) => ({ ...f, content: v }));
  }, []);

  const addHashtag = useCallback((slug: string) => {
    setForm((f) => {
      if (f.hashtagSlugs.includes(slug) || f.hashtagSlugs.length >= MAX_HASHTAGS) return f;
      return { ...f, hashtagSlugs: [...f.hashtagSlugs, slug] };
    });
  }, []);

  const removeHashtag = useCallback((slug: string) => {
    setForm((f) => ({ ...f, hashtagSlugs: f.hashtagSlugs.filter((s) => s !== slug) }));
  }, []);

  const addImage = useCallback((dataUrl: string) => {
    setForm((f) => {
      if (f.imageUrls.length >= MAX_IMAGES) return f;
      return { ...f, imageUrls: [...f.imageUrls, dataUrl] };
    });
  }, []);

  const removeImage = useCallback((index: number) => {
    setForm((f) => ({ ...f, imageUrls: f.imageUrls.filter((_, i) => i !== index) }));
  }, []);

  const setAnonymous = useCallback((v: boolean) => {
    setForm((f) => ({ ...f, isAnonymous: v }));
  }, []);

  const setAnonymousName = useCallback((v: string) => {
    setForm((f) => ({ ...f, anonymousName: v }));
  }, []);

  const toInput = (): CreateKudosInput => ({
    receiverId: form.receiverId,
    title: form.title,
    content: form.content,
    hashtagSlugs: form.hashtagSlugs,
    imageUrls: form.imageUrls,
    isAnonymous: form.isAnonymous,
    anonymousName: form.isAnonymous && form.anonymousName.trim() ? form.anonymousName.trim() : null,
  });

  return {
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
  };
}
