USE `parking_system`;


-- Схема на данните от таблица `users`
INSERT INTO `users` (`id`, `firstname`, `lastname`, `sex`, `email`, `password`, `user_type`, `car_number`) VALUES
(1, 'Боян', 'Бончев', 'M', 'boyanb@fmi.uni-sofia.bg', '$2y$10$miPMSJT.xylQVBg4/lwFIOIDbaXjzKNN0S3IKhqAP.E3U1YAvpIe6', 'Щатен преподавател', 'CB6412HX'),
(2, 'Ирена', 'Павлова', 'F', 'irenap@gmail.com', '$2y$10$nUS6b5.sQy/yy2EPb1LwrenF5NtNI8BuKlcoxmdT953LtZE3GDoXK', 'Хоноруван преподавател', 'C1265KH');


-- Схема на данните от таблица `reservations`
INSERT INTO `reservations` (`id`, `user_id`, `slot_id`, `start_time`, `end_time`, `date`) VALUES
(1, 2, 16, '10:00:00', '13:00:00', '2022-06-13'),
(2, 2, 11, '09:00:00', '12:00:00', '2022-06-15'),
(3, 2, 15, '13:00:00', '15:00:00', '2022-06-15');


-- Схема на данните от таблица `schedules`
INSERT INTO `schedules`
(`id`, `discipline_name`,     `discipline_type`,  `date`,       `start_time`,   `end_time`, `faculty`) 
VALUES
(7,   'АСИ',                 'Упражнение',       '2022-06-13', '10:00:00',     '12:00:00', 'ФМИ'),
(8,   'УСИ',                 'Упражнение',       '2022-06-14', '09:00:00',     '11:00:00', 'ФМИ'),
(9,   'АСИ',                 'Лекция',           '2022-06-15', '09:00:00',     '12:00:00', 'ФХФ'),
(10,  'УСИ',                 'Лекция',           '2022-06-15', '13:00:00',     '15:00:00', 'ФМИ');


-- Схема на данните от таблица `user_schedules`
INSERT INTO `user_schedules` (`user_id`, `schedule_id`) VALUES
(2, 7),
(2, 8),
(2, 9),
(2, 10);