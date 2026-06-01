# Viết Kudo — Viewpoints (filtered to explicit source)

Reference packaged overlaps: InputBox, Textarea, RichTextBox_Markdown, Tags, Search,
Dialog_popup, Checkbox (toggle). Kept only viewpoints refining existing behavior.

## InputBox / Search (recipient)
- Verify required validation (empty → error), autocomplete filtering, and select-to-populate.

## RichTextBox / Textarea (content)
- Verify required validation, formatting toggles apply/remove, link insertion via dialog, and "@" mention suggestions.

## Tags (hashtag)
- Verify add via dropdown, remove via chip "x", min 1 and max 5 enforcement.

## Image upload
- Verify add via picker, remove via "x", max 5 (add button hidden at 5).

## Dialog / toggle / submit
- Verify "Gửi" disabled until required fields filled, submit shows loading and closes on success; "Hủy" discards.
- Verify anonymous toggle reveals the anonymous-name field.

## Discarded (not in design — do NOT generate)
- Draft autosave, file type/size limits (not specified), server-side error families, scheduling.
