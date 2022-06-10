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
    `sex` enum ('F','M'),
    `email` varchar(50) NOT NULL UNIQUE KEY,
    `password` varchar(100) NOT NULL,
    `user_type` enum('Щатен преподавател','Хоноруван преподавател') NOT NULL,
    `qr_generated_time` datetime,
    `car_number` varchar(10)
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
    `lecturer_only` tinyint(1) NOT NULL, 
    UNIQUE KEY `unique_code_zone` (`code`,`zone`) USING BTREE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


  -- Схема на данните от таблица `slots`
  INSERT INTO `slots` (`code`, `zone`, `lecturer_only` ) VALUES
  (0, 'A', 1),
  (1, 'A', 1),
  (2, 'A', 1),
  (3, 'A', 1),
  (4, 'A', 1),
  (5, 'A', 0),
  (6, 'A', 0),
  (7, 'A', 0),
  (8, 'A', 0),
  (9, 'A', 0),
  (0, 'B', 0),
  (1, 'B', 0),
  (2, 'B', 0),
  (3, 'B', 0),
  (4, 'B', 0),
  (5, 'B', 0),
  (6, 'B', 0),
  (7, 'B', 0),
  (8, 'B', 0),
  (9, 'B', 0),
  (10, 'B', 1),
  (11, 'B', 1),
  (12, 'B', 1),
  (13, 'B', 1),
  (14, 'B', 1),
  (15, 'B', 1), 
  (0, 'C', 1),
  (1, 'C', 1),
  (2, 'C', 1),
  (3, 'C', 1),
  (4, 'C', 1),
  (5, 'C', 1),
  (6, 'C', 1),
  (7, 'C', 0),
  (8, 'C', 0),
  (9, 'C', 0),
  (10, 'C', 0),
  (11, 'C', 0),
  (12, 'C', 0),
  (13, 'C', 0),
  (14, 'C', 0),
  (15, 'C', 0),
  (16, 'C', 0),
  (17, 'C', 0);


  -- Ограничения за таблица `reservations`
  ALTER TABLE `reservations`
    ADD CONSTRAINT `reservations_ibfk_1` FOREIGN KEY (`slot_id`) REFERENCES `slots` (`id`),
    ADD CONSTRAINT `reservations_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);


  -- Ограничения за таблица `user_schedules`
  ALTER TABLE `user_schedules`
    ADD CONSTRAINT `user_schedules_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
    ADD CONSTRAINT `user_schedules_ibfk_2` FOREIGN KEY (`schedule_id`) REFERENCES `schedules` (`id`);
    
COMMIT;