-- Translate specialties to Vietnamese
UPDATE doctors SET specialty = 'Đa khoa'    WHERE name = 'Dr. Nguyen Van An';
UPDATE doctors SET specialty = 'Tim mạch'   WHERE name = 'Dr. Tran Thi Bich';
UPDATE doctors SET specialty = 'Da liễu'    WHERE name = 'Dr. Le Hoang Cuong';
UPDATE doctors SET specialty = 'Chỉnh hình' WHERE name = 'Dr. Pham Minh Duc';
UPDATE doctors SET specialty = 'Nhi khoa'   WHERE name = 'Dr. Hoang Thi Lan';

-- Dr. Nguyen Van An — Đa khoa: Thứ 2–5 sáng, Thứ 2+4 chiều
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time)
SELECT id, 'MONDAY',    '08:00', '12:00' FROM doctors WHERE name = 'Dr. Nguyen Van An';
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time)
SELECT id, 'MONDAY',    '13:00', '17:00' FROM doctors WHERE name = 'Dr. Nguyen Van An';
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time)
SELECT id, 'TUESDAY',   '08:00', '12:00' FROM doctors WHERE name = 'Dr. Nguyen Van An';
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time)
SELECT id, 'WEDNESDAY', '08:00', '12:00' FROM doctors WHERE name = 'Dr. Nguyen Van An';
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time)
SELECT id, 'WEDNESDAY', '13:00', '17:00' FROM doctors WHERE name = 'Dr. Nguyen Van An';
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time)
SELECT id, 'THURSDAY',  '08:00', '12:00' FROM doctors WHERE name = 'Dr. Nguyen Van An';
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time)
SELECT id, 'FRIDAY',    '08:00', '11:30' FROM doctors WHERE name = 'Dr. Nguyen Van An';

-- Dr. Tran Thi Bich — Tim mạch: Thứ 2, 4, 6
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time)
SELECT id, 'MONDAY',    '08:00', '11:30' FROM doctors WHERE name = 'Dr. Tran Thi Bich';
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time)
SELECT id, 'WEDNESDAY', '13:00', '17:00' FROM doctors WHERE name = 'Dr. Tran Thi Bich';
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time)
SELECT id, 'FRIDAY',    '08:00', '12:00' FROM doctors WHERE name = 'Dr. Tran Thi Bich';
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time)
SELECT id, 'FRIDAY',    '13:30', '17:00' FROM doctors WHERE name = 'Dr. Tran Thi Bich';

-- Dr. Le Hoang Cuong — Da liễu: Thứ 3, 5, 7
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time)
SELECT id, 'TUESDAY',   '08:30', '12:00' FROM doctors WHERE name = 'Dr. Le Hoang Cuong';
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time)
SELECT id, 'TUESDAY',   '13:30', '17:00' FROM doctors WHERE name = 'Dr. Le Hoang Cuong';
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time)
SELECT id, 'THURSDAY',  '08:30', '12:00' FROM doctors WHERE name = 'Dr. Le Hoang Cuong';
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time)
SELECT id, 'SATURDAY',  '08:00', '12:00' FROM doctors WHERE name = 'Dr. Le Hoang Cuong';

-- Dr. Pham Minh Duc — Chỉnh hình: Thứ 2, 3, 6 chiều
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time)
SELECT id, 'MONDAY',    '13:00', '17:30' FROM doctors WHERE name = 'Dr. Pham Minh Duc';
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time)
SELECT id, 'TUESDAY',   '08:00', '12:00' FROM doctors WHERE name = 'Dr. Pham Minh Duc';
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time)
SELECT id, 'SATURDAY',  '08:00', '11:00' FROM doctors WHERE name = 'Dr. Pham Minh Duc';
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time)
SELECT id, 'SATURDAY',  '13:00', '16:00' FROM doctors WHERE name = 'Dr. Pham Minh Duc';

-- Dr. Hoang Thi Lan — Nhi khoa: Thứ 2–6 buổi sáng
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time)
SELECT id, 'MONDAY',    '07:30', '11:30' FROM doctors WHERE name = 'Dr. Hoang Thi Lan';
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time)
SELECT id, 'TUESDAY',   '07:30', '11:30' FROM doctors WHERE name = 'Dr. Hoang Thi Lan';
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time)
SELECT id, 'WEDNESDAY', '07:30', '11:30' FROM doctors WHERE name = 'Dr. Hoang Thi Lan';
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time)
SELECT id, 'THURSDAY',  '07:30', '11:30' FROM doctors WHERE name = 'Dr. Hoang Thi Lan';
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time)
SELECT id, 'FRIDAY',    '07:30', '11:30' FROM doctors WHERE name = 'Dr. Hoang Thi Lan';
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time)
SELECT id, 'FRIDAY',    '13:00', '16:30' FROM doctors WHERE name = 'Dr. Hoang Thi Lan';
