-- Seed: awards (homepage) + users + departments + hashtags + kudos posts + sample likes.

insert into public.departments (id, slug, name) values
  ('11111111-0000-0000-0000-000000000001', 'engineering', 'Engineering'),
  ('11111111-0000-0000-0000-000000000002', 'design',      'Design'),
  ('11111111-0000-0000-0000-000000000003', 'marketing',   'Marketing'),
  ('11111111-0000-0000-0000-000000000004', 'people-ops',  'People Operations')
on conflict (slug) do update set name = excluded.name;

insert into public.users (id, email, display_name, role, department_id, avatar_url) values
  ('00000000-0000-0000-0000-000000000001', 'demo@sun-asterisk.com',  'Demo User',        'regular', '11111111-0000-0000-0000-000000000001', 'https://i.pravatar.cc/150?img=12'),
  ('00000000-0000-0000-0000-000000000002', 'admin@sun-asterisk.com', 'Demo Admin',       'admin',   '11111111-0000-0000-0000-000000000004', 'https://i.pravatar.cc/150?img=33'),
  ('00000000-0000-0000-0000-000000000003', 'huong@sun-asterisk.com', 'Nguyễn Thu Hương', 'regular', '11111111-0000-0000-0000-000000000002', 'https://i.pravatar.cc/150?img=5'),
  ('00000000-0000-0000-0000-000000000004', 'tuan@sun-asterisk.com',  'Trần Anh Tuấn',    'regular', '11111111-0000-0000-0000-000000000001', 'https://i.pravatar.cc/150?img=8'),
  ('00000000-0000-0000-0000-000000000005', 'mai@sun-asterisk.com',   'Phạm Phương Mai',  'regular', '11111111-0000-0000-0000-000000000003', 'https://i.pravatar.cc/150?img=47'),
  ('00000000-0000-0000-0000-000000000006', 'minh@sun-asterisk.com',  'Lê Quang Minh',    'regular', '11111111-0000-0000-0000-000000000001', 'https://i.pravatar.cc/150?img=15')
on conflict (email) do update set
  display_name  = excluded.display_name,
  role          = excluded.role,
  department_id = excluded.department_id,
  avatar_url    = excluded.avatar_url;

insert into public.awards (slug, title, description, display_order, prize_count, unit_label, prize_value) values
  ('top-talent',         'Top Talent',                   'Vinh danh top cá nhân xuất sắc trên mọi phương diện. Giải thưởng dành cho những Sunner đã thể hiện tài năng vượt trội.', 1, 10, 'Đơn vị', '7.000.000 VNĐ'),
  ('top-project',        'Top Project',                  'Tôn vinh những dự án xuất sắc nhất năm — sản phẩm thực thi xuất sắc, mang lại tác động thực tế cho khách hàng và đội ngũ Sun*.', 2, 2, 'Tập thể', '15.000.000 VNĐ'),
  ('top-project-leader', 'Top Project Leader',           'Người dẫn dắt dự án truyền cảm hứng, đưa đội ngũ vượt qua thử thách và đạt thành quả vững chắc.', 3, 3, 'Cá nhân', '7.000.000 VNĐ'),
  ('best-manager',       'Best Manager',                 'Quản lý xuất sắc trong việc phát triển con người, xây dựng đội ngũ vững mạnh và giữ vững tinh thần văn hóa Sun*.', 4, 1, 'Cá nhân', '10.000.000 VNĐ'),
  ('signature-creator',  'Signature 2025 - Creator',     'Dấu ấn sáng tạo nổi bật trong năm — cá nhân hay tập thể đã tạo ra dấu ấn riêng cho Sun*.', 5, 1, null, E'5.000.000 VNĐ (cá nhân)\n8.000.000 VNĐ (tập thể)'),
  ('mvp',                'MVP (Most Valuable Person)',   'Cá nhân có đóng góp giá trị nhất cho tổ chức — người đại diện cho tinh thần Sun* trong năm 2025.', 6, 1, null, '15.000.000 VNĐ')
on conflict (slug) do update set
  description   = excluded.description,
  display_order = excluded.display_order,
  prize_count   = excluded.prize_count,
  unit_label    = excluded.unit_label,
  prize_value   = excluded.prize_value;

insert into public.hashtags (id, slug, label) values
  ('22222222-0000-0000-0000-000000000001', 'dedicated',     'Dedicated'),
  ('22222222-0000-0000-0000-000000000002', 'inspiring',     'Inspiring'),
  ('22222222-0000-0000-0000-000000000003', 'idol-gioi-tre', 'Idol giới trẻ'),
  ('22222222-0000-0000-0000-000000000004', 'collaborative', 'Collaborative'),
  ('22222222-0000-0000-0000-000000000005', 'creative',      'Creative')
on conflict (slug) do update set label = excluded.label;

insert into public.kudos (id, sender_id, receiver_id, title, content, created_at, image_urls) values
  ('33333333-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'IDOL GIỚI TRẺ', 'Cảm ơn Hương đã giúp team review thiết kế mới — tâm huyết và kỹ lưỡng đến từng chi tiết. Luôn nhắc mình phải nỗ lực hơn nữa trong công việc. <3 và cuộc sống.', now() - interval '2 days', array['https://picsum.photos/seed/kudos1a/200','https://picsum.photos/seed/kudos1b/200','https://picsum.photos/seed/kudos1c/200','https://picsum.photos/seed/kudos1d/200','https://picsum.photos/seed/kudos1e/200']),
  ('33333333-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', 'NGƯỜI TRUYỀN LỬA', 'Tuấn ơi, ship được feature đó trước deadline 1 tuần luôn, đỉnh quá!', now() - interval '3 days', array['https://picsum.photos/seed/kudos2a/200','https://picsum.photos/seed/kudos2b/200','https://picsum.photos/seed/kudos2c/200']),
  ('33333333-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000006', 'CHIẾN BINH THẦM LẶNG', 'Cảm ơn Minh đã trực ca khuya để khắc phục sự cố production.', now() - interval '5 days', '{}'),
  ('33333333-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', 'NGÔI SAO MARKETING', 'Mai vừa hoàn thành chiến dịch marketing tháng này với hiệu quả vượt mong đợi. Tự hào về team!', now() - interval '1 day', array['https://picsum.photos/seed/kudos4a/200','https://picsum.photos/seed/kudos4b/200']),
  ('33333333-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'NGƯỜI THẦY TẬN TÂM', 'Cảm ơn Demo đã hướng dẫn mình suốt tuần qua — kiên nhẫn và tận tâm vô đối.', now() - interval '4 days', '{}'),
  ('33333333-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000003', 'CHỖ DỰA CỦA TEAM', 'Hương luôn là người sẵn sàng hỗ trợ — không có Hương team chắc đã không vượt được sprint này.', now() - interval '7 days', '{}')
on conflict (id) do update set title = excluded.title, image_urls = excluded.image_urls;

insert into public.kudos_hashtags (kudos_id, hashtag_id) values
  ('33333333-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000001'),
  ('33333333-0000-0000-0000-000000000001', '22222222-0000-0000-0000-000000000002'),
  ('33333333-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000001'),
  ('33333333-0000-0000-0000-000000000002', '22222222-0000-0000-0000-000000000004'),
  ('33333333-0000-0000-0000-000000000003', '22222222-0000-0000-0000-000000000001'),
  ('33333333-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000003'),
  ('33333333-0000-0000-0000-000000000004', '22222222-0000-0000-0000-000000000005'),
  ('33333333-0000-0000-0000-000000000005', '22222222-0000-0000-0000-000000000002'),
  ('33333333-0000-0000-0000-000000000005', '22222222-0000-0000-0000-000000000004'),
  ('33333333-0000-0000-0000-000000000006', '22222222-0000-0000-0000-000000000001'),
  ('33333333-0000-0000-0000-000000000006', '22222222-0000-0000-0000-000000000004')
on conflict do nothing;

insert into public.kudos_likes (kudos_id, user_id, weight) values
  ('33333333-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 1),
  ('33333333-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', 1),
  ('33333333-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000006', 2),
  ('33333333-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 1),
  ('33333333-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', 1),
  ('33333333-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 1),
  ('33333333-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 1),
  ('33333333-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', 1),
  ('33333333-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 1),
  ('33333333-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', 1),
  ('33333333-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000006', 2),
  ('33333333-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003', 1),
  ('33333333-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000004', 1),
  ('33333333-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000005', 1)
on conflict do nothing;

-- Filler kudos to drive Hero-badge variety. Badge derives from a user's received-kudos
-- count: ≥10 → Rising (1★), ≥20 → Super (2★), ≥50 → Legend (3★). Deterministic IDs keep
-- the seed idempotent; older timestamps keep the six showcased kudos at the top of the feed.
insert into public.kudos (id, sender_id, receiver_id, content, created_at)
select
  ('44444444-0000-0000-0000-' || lpad(g::text, 12, '0'))::uuid,
  (case when g % 2 = 0 then '00000000-0000-0000-0000-000000000004' else '00000000-0000-0000-0000-000000000005' end)::uuid,
  '00000000-0000-0000-0000-000000000003',  -- Hương → 50 received (Legend Hero)
  'Cảm ơn Hương đã luôn lan tỏa năng lượng tích cực đến cả team! (#' || g || ')',
  now() - interval '10 days' - (g || ' hours')::interval
from generate_series(1, 48) g
on conflict (id) do nothing;

insert into public.kudos (id, sender_id, receiver_id, content, created_at)
select
  ('55555555-0000-0000-0000-' || lpad(g::text, 12, '0'))::uuid,
  (case when g % 2 = 0 then '00000000-0000-0000-0000-000000000003' else '00000000-0000-0000-0000-000000000004' end)::uuid,
  '00000000-0000-0000-0000-000000000005',  -- Mai → 20 received (Super Hero)
  'Cảm ơn Mai vì những chiến dịch sáng tạo và hết mình! (#' || g || ')',
  now() - interval '12 days' - (g || ' hours')::interval
from generate_series(1, 19) g
on conflict (id) do nothing;

insert into public.kudos (id, sender_id, receiver_id, content, created_at)
select
  ('66666666-0000-0000-0000-' || lpad(g::text, 12, '0'))::uuid,
  (case when g % 2 = 0 then '00000000-0000-0000-0000-000000000003' else '00000000-0000-0000-0000-000000000005' end)::uuid,
  '00000000-0000-0000-0000-000000000004',  -- Tuấn → 10 received (Rising Hero)
  'Cảm ơn Tuấn đã hỗ trợ ship feature đúng hạn! (#' || g || ')',
  now() - interval '14 days' - (g || ' hours')::interval
from generate_series(1, 9) g
on conflict (id) do nothing;

insert into public.notifications (user_id, title, body, read_at) values
  ('00000000-0000-0000-0000-000000000001', 'Welcome to SAA 2025', 'Sự kiện sắp diễn ra, đừng bỏ lỡ.', null),
  ('00000000-0000-0000-0000-000000000001', 'Đề cử mở',            'Đề cử cho Top Talent đang mở.',     null),
  ('00000000-0000-0000-0000-000000000001', 'Cảm ơn',              'Cảm ơn bạn đã tham gia khảo sát.',  now() - interval '2 days'),
  ('00000000-0000-0000-0000-000000000002', 'Admin notice',        'Bảng điều khiển admin đã sẵn sàng.', null);
