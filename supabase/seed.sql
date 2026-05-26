-- Seed: 6 awards from MoMorph Homepage SAA design + mock user + sample notifications.
-- Award descriptions include prize details for the Awards Information detail page.

insert into public.users (id, email, display_name, role) values
  ('00000000-0000-0000-0000-000000000001', 'demo@sun-asterisk.com', 'Demo User', 'regular'),
  ('00000000-0000-0000-0000-000000000002', 'admin@sun-asterisk.com', 'Demo Admin', 'admin')
on conflict (email) do nothing;

insert into public.awards (slug, title, description, display_order, prize_count, unit_label, prize_value) values
  ('top-talent',
   'Top Talent',
   'Vinh danh top cá nhân xuất sắc trên mọi phương diện. Giải thưởng dành cho những Sunner đã thể hiện tài năng vượt trội, đóng góp giá trị nổi bật cho tổ chức trong năm 2025.',
   1, 10, 'Đơn vị', '7.000.000 VNĐ'),
  ('top-project',
   'Top Project',
   'Tôn vinh những dự án xuất sắc nhất năm — sản phẩm thực thi xuất sắc, mang lại tác động thực tế cho khách hàng và đội ngũ Sun*.',
   2, 2, 'Tập thể', '15.000.000 VNĐ'),
  ('top-project-leader',
   'Top Project Leader',
   'Người dẫn dắt dự án truyền cảm hứng, đưa đội ngũ vượt qua thử thách và đạt thành quả vững chắc trong suốt năm.',
   3, 3, 'Cá nhân', '7.000.000 VNĐ'),
  ('best-manager',
   'Best Manager',
   'Quản lý xuất sắc trong việc phát triển con người, xây dựng đội ngũ vững mạnh và giữ vững tinh thần văn hóa Sun*.',
   4, 1, 'Cá nhân', '10.000.000 VNĐ'),
  ('signature-creator',
   'Signature 2025 - Creator',
   'Dấu ấn sáng tạo nổi bật trong năm — cá nhân hay tập thể đã tạo ra dấu ấn riêng cho Sun* qua tác phẩm, sản phẩm, hoạt động.',
   5, 1, null, E'5.000.000 VNĐ (cá nhân)\n8.000.000 VNĐ (tập thể)'),
  ('mvp',
   'MVP (Most Valuable Person)',
   'Cá nhân có đóng góp giá trị nhất cho tổ chức — người đại diện cho tinh thần Sun* trong năm 2025.',
   6, 1, null, '15.000.000 VNĐ')
on conflict (slug) do update set
  description   = excluded.description,
  display_order = excluded.display_order,
  prize_count   = excluded.prize_count,
  unit_label    = excluded.unit_label,
  prize_value   = excluded.prize_value;

insert into public.notifications (user_id, title, body, read_at) values
  ('00000000-0000-0000-0000-000000000001', 'Welcome to SAA 2025', 'Sự kiện sắp diễn ra, đừng bỏ lỡ.', null),
  ('00000000-0000-0000-0000-000000000001', 'Đề cử mở',            'Đề cử cho Top Talent đang mở.',     null),
  ('00000000-0000-0000-0000-000000000001', 'Cảm ơn',              'Cảm ơn bạn đã tham gia khảo sát.',  now() - interval '2 days'),
  ('00000000-0000-0000-0000-000000000002', 'Admin notice',        'Bảng điều khiển admin đã sẵn sàng.', null);
