// Single source of truth for compose-kudo validation, shared by the compose form
// (UX: enable/disable submit) and the createKudos server action (defensive guard).
// Keeping the rules here avoids drift between client and server (DRY).

import type { CreateKudosInput } from "./types";

export const MAX_HASHTAGS = 5;
export const MAX_IMAGES = 5;
// Cap per-image bytes — images are stored inline as data URLs, so oversized files
// bloat the kudos row and request payload. 2 MB is generous for a thumbnail.
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

// Only JPG/PNG are accepted attachments (per spec). Used by the image uploader
// and reusable in tests for the file-type guard.
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png"] as const;

export function isAcceptedImageType(mimeType: string): boolean {
  return (ACCEPTED_IMAGE_TYPES as readonly string[]).includes(mimeType);
}

// Pure validity check. When `senderId` is given, also enforces receiver !== sender
// (mirrors the DB `sender_not_receiver` constraint). The form omits `senderId`
// because it already excludes the sender from the recipient list.
export function isComposeInputValid(input: CreateKudosInput, senderId?: string): boolean {
  if (!input.receiverId.trim()) return false;
  if (senderId && input.receiverId === senderId) return false;
  if (!input.title.trim()) return false;
  if (!input.content.trim()) return false;
  if (input.hashtagSlugs.length < 1 || input.hashtagSlugs.length > MAX_HASHTAGS) return false;
  if (input.imageUrls.length > MAX_IMAGES) return false;
  return true;
}

// Throwing guard for the server action. Messages are stable so they can be asserted.
export function assertValidCreateKudosInput(input: CreateKudosInput, senderId: string): void {
  if (!input.receiverId || input.receiverId === senderId) {
    throw new Error("Invalid receiver: must be a different user");
  }
  if (!input.title.trim()) throw new Error("Title must not be empty");
  if (!input.content.trim()) throw new Error("Content must not be empty");
  if (input.hashtagSlugs.length < 1 || input.hashtagSlugs.length > MAX_HASHTAGS) {
    throw new Error("Select between 1 and 5 hashtags");
  }
  if (input.imageUrls.length > MAX_IMAGES) throw new Error("Maximum 5 images allowed");
}
