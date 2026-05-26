-- Seed: 6 awards from MoMorph Homepage SAA design + mock user + sample notifications.

insert into public.users (id, email, display_name, role) values
  ('00000000-0000-0000-0000-000000000001', 'demo@sun-asterisk.com', 'Demo User', 'regular'),
  ('00000000-0000-0000-0000-000000000002', 'admin@sun-asterisk.com', 'Demo Admin', 'admin')
on conflict (email) do nothing;

insert into public.awards (slug, title, description, display_order) values
  ('top-talent',         'Top Talent',                   'Vinh danh top cá nhân xuất sắc trên mọi phương diện', 1),
  ('top-project',        'Top Project',                  'Tôn vinh những dự án xuất sắc nhất năm',                2),
  ('top-project-leader', 'Top Project Leader',           'Lãnh đạo dự án truyền cảm hứng và dẫn dắt thành công',  3),
  ('best-manager',       'Best Manager',                 'Quản lý xuất sắc, phát triển đội ngũ vững mạnh',        4),
  ('signature-creator',  'Signature 2025 - Creator',     'Dấu ấn sáng tạo nổi bật trong năm 2025',                5),
  ('mvp',                'MVP (Most Valuable Person)',   'Cá nhân có đóng góp giá trị nhất cho tổ chức',           6)
on conflict (slug) do nothing;

insert into public.notifications (user_id, title, body, read_at) values
  ('00000000-0000-0000-0000-000000000001', 'Welcome to SAA 2025', 'Sự kiện sắp diễn ra, đừng bỏ lỡ.', null),
  ('00000000-0000-0000-0000-000000000001', 'Đề cử mở',            'Đề cử cho Top Talent đang mở.',     null),
  ('00000000-0000-0000-0000-000000000001', 'Cảm ơn',              'Cảm ơn bạn đã tham gia khảo sát.',  now() - interval '2 days'),
  ('00000000-0000-0000-0000-000000000002', 'Admin notice',        'Bảng điều khiển admin đã sẵn sàng.', null);
