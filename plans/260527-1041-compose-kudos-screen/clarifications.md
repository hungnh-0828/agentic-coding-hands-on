# Clarifications — Compose Kudo Screen (Viết Kudo)

MoMorph: https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/ihQ26W78P2
Screen: "Viết Kudo" (screen_id: ihQ26W78P2, frame_link_id: 520:11602)

## Session 2026-05-27

- Q: Khi bấm "Gửi", form xử lý dữ liệu thế nào? → A: Real Supabase insert — server action `createKudos` ghi vào bảng `kudos` (cần migration thêm cột title/images/anonymous + RLS write).
- Q: Trường "Danh hiệu" có trong design+ảnh (bắt buộc *) nhưng không có trong specs CSV. Xử lý sao? → A: Bao gồm theo design — input bắt buộc, hint "Ví dụ...", dùng làm tiêu đề Kudos.
- Q: Độ sâu của trình soạn thảo (toolbar B/I/S/list/link/quote + @mention)? → A: Visual-only toolbar — toolbar + textarea đúng design, nút có trạng thái nhưng logic format tối giản (KISS).
- Q: Modal mở từ đâu? → A: Từ nút SendKudosInput hiện có trên trang sun-kudos (mở modal compose).
- Q: Nguồn dữ liệu autocomplete người nhận + @mention? → A: (resolved by code) Bảng `users` (display_name, department). Loại bỏ demo sender khỏi danh sách người nhận.
- Q: Lưu ảnh thế nào khi insert thật mà không cần Supabase Storage infra? → A: (resolved KISS) Lưu data URL ảnh vào cột `image_urls text[]` trên bảng `kudos`. Trường ảnh không bắt buộc, tối đa 5.
- Q: Sender là ai (chưa có real auth)? → A: (resolved by code) Dùng DEMO user id "00000000-0000-0000-0000-000000000001" như các màn trước (TODO auth).
