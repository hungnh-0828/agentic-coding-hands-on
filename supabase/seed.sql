-- Seed: awards (homepage) + users + departments + hashtags + kudos posts + sample likes.

insert into public.departments (id, slug, name) values
  ('11111111-0000-0000-0000-000000000001', 'engineering', 'Engineering'),
  ('11111111-0000-0000-0000-000000000002', 'design',      'Design'),
  ('11111111-0000-0000-0000-000000000003', 'marketing',   'Marketing'),
  ('11111111-0000-0000-0000-000000000004', 'people-ops',  'People Operations')
on conflict (slug) do update set name = excluded.name;

insert into public.users (id, email, display_name, role, department_id) values
  ('00000000-0000-0000-0000-000000000001', 'demo@sun-asterisk.com',  'Demo User',        'regular', '11111111-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000002', 'admin@sun-asterisk.com', 'Demo Admin',       'admin',   '11111111-0000-0000-0000-000000000004'),
  ('00000000-0000-0000-0000-000000000003', 'huong@sun-asterisk.com', 'Nguyễn Thu Hương', 'regular', '11111111-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000004', 'tuan@sun-asterisk.com',  'Trần Anh Tuấn',    'regular', '11111111-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000005', 'mai@sun-asterisk.com',   'Phạm Phương Mai',  'regular', '11111111-0000-0000-0000-000000000003'),
  ('00000000-0000-0000-0000-000000000006', 'minh@sun-asterisk.com',  'Lê Quang Minh',    'regular', '11111111-0000-0000-0000-000000000001')
on conflict (email) do update set
  display_name  = excluded.display_name,
  role          = excluded.role,
  department_id = excluded.department_id;

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

insert into public.kudos (id, sender_id, receiver_id, content, created_at) values
  ('33333333-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'Cảm ơn Hương đã giúp team review thiết kế mới — tâm huyết và kỹ lưỡng đến từng chi tiết.', now() - interval '2 days'),
  ('33333333-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', 'Tuấn ơi, ship được feature đó trước deadline 1 tuần luôn, đỉnh quá!', now() - interval '3 days'),
  ('33333333-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000006', 'Cảm ơn Minh đã trực ca khuya để khắc phục sự cố production.', now() - interval '5 days'),
  ('33333333-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', 'Mai vừa hoàn thành chiến dịch marketing tháng này với hiệu quả vượt mong đợi. Tự hào về team!', now() - interval '1 day'),
  ('33333333-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Cảm ơn Demo đã hướng dẫn mình suốt tuần qua — kiên nhẫn và tận tâm vô đối.', now() - interval '4 days'),
  ('33333333-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000003', 'Hương luôn là người sẵn sàng hỗ trợ — không có Hương team chắc đã không vượt được sprint này.', now() - interval '7 days')
on conflict (id) do nothing;

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

insert into public.notifications (user_id, title, body, read_at) values
  ('00000000-0000-0000-0000-000000000001', 'Welcome to SAA 2025', 'Sự kiện sắp diễn ra, đừng bỏ lỡ.', null),
  ('00000000-0000-0000-0000-000000000001', 'Đề cử mở',            'Đề cử cho Top Talent đang mở.',     null),
  ('00000000-0000-0000-0000-000000000001', 'Cảm ơn',              'Cảm ơn bạn đã tham gia khảo sát.',  now() - interval '2 days'),
  ('00000000-0000-0000-0000-000000000002', 'Admin notice',        'Bảng điều khiển admin đã sẵn sàng.', null);
