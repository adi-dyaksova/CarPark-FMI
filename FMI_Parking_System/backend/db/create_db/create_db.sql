START TRANSACTION;
  SET time_zone = "+00:00";


  -- База данни: `parking_system`
  CREATE DATABASE IF NOT EXISTS `parking_system` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
  USE `parking_system`;


  -- Структура на таблица `reservations`
  CREATE TABLE `reservations` (
    `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id` int(11) UNSIGNED NOT NULL,
    `slot_id` int(11) NOT NULL,
    `start_time` time NOT NULL,
    `end_time` time NOT NULL,
    `date` date NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


  -- Структура на таблица `schedules`
  CREATE TABLE `schedules` (
    `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `discipline_name` varchar(50) NOT NULL,
    `discipline_type` enum('Лекция','Упражнение') NOT NULL,
    `date` date NOT NULL,
    `start_time` time NOT NULL,
    `end_time` time NOT NULL,
    `faculty` enum('ФМИ','ФХФ','ФЗФ') NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


  -- Структура на таблица `users`
  CREATE TABLE `users` (
    `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `firstname` varchar(30) NOT NULL,
    `lastname` varchar(30) NOT NULL,
    `email` varchar(50) NOT NULL UNIQUE KEY,
    `password` varchar(100) NOT NULL,
    `user_type` enum('Щатен преподавател','Хоноруван преподавател') NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


  -- Структура на таблица `user_schedules`
  CREATE TABLE `user_schedules` (
    `user_id` int(10) UNSIGNED NOT NULL,
    `schedule_id` int(10) UNSIGNED NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


  -- Структура на таблица `slots`
  CREATE TABLE `slots` (
    `id` int(11) AUTO_INCREMENT PRIMARY KEY ,
    `code` int(1) NOT NULL,
    `zone` varchar(1) NOT NULL,
    UNIQUE KEY `unique_code_zone` (`code`,`zone`) USING BTREE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


  -- Схема на данните от таблица `slots`
  INSERT INTO `slots` (`code`, `zone`) VALUES
  (0, 'A'),
  (1, 'A'),
  (2, 'A'),
  (3, 'A'),
  (4, 'A'),
  (5, 'A'),
  (6, 'A'),
  (7, 'A'),
  (8, 'A'),
  (9, 'A'),
  (0, 'B'),
  (1, 'B'),
  (2, 'B'),
  (3, 'B'),
  (4, 'B'),
  (5, 'B'),
  (6, 'B'),
  (7, 'B'),
  (8, 'B'),
  (9, 'B'),
  (10, 'B'),
  (11, 'B'),
  (12, 'B'),
  (13, 'B'),
  (14, 'B'),
  (15, 'B'), 
  (0, 'C'),
  (1, 'C'),
  (2, 'C'),
  (3, 'C'),
  (4, 'C'),
  (5, 'C'),
  (6, 'C'),
  (7, 'C'),
  (8, 'C'),
  (9, 'C'),
  (10, 'C'),
  (11, 'C'),
  (12, 'C'),
  (13, 'C'),
  (14, 'C'),
  (15, 'C'),
  (16, 'C'),
  (17, 'C');


  -- Ограничения за таблица `reservations`
  ALTER TABLE `reservations`
    ADD CONSTRAINT `reservations_ibfk_1` FOREIGN KEY (`slot_id`) REFERENCES `slots` (`id`),
    ADD CONSTRAINT `reservations_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);


  -- Ограничения за таблица `user_schedules`
  ALTER TABLE `user_schedules`
    ADD CONSTRAINT `user_schedules_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
    ADD CONSTRAINT `user_schedules_ibfk_2` FOREIGN KEY (`schedule_id`) REFERENCES `schedules` (`id`);
    
COMMIT;