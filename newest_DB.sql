-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: cap
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `answers`
--

DROP TABLE IF EXISTS `answers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `answers` (
  `answer_id` int NOT NULL AUTO_INCREMENT,
  `question_id` int NOT NULL,
  `answer_text` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_correct` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`answer_id`),
  KEY `question_id` (`question_id`),
  CONSTRAINT `answers_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `questions` (`question_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `answers`
--

LOCK TABLES `answers` WRITE;
/*!40000 ALTER TABLE `answers` DISABLE KEYS */;
INSERT INTO `answers` VALUES (1,1,'Paris',1),(2,1,'Paris',1),(3,1,'Paris',1),(4,1,'PHnom pênh',1);
/*!40000 ALTER TABLE `answers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `category_name` (`category_name`),
  KEY `fk_user_id_idx` (`user_id`),
  CONSTRAINT `fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Science',NULL),(2,'History',NULL),(3,'Geography',NULL);
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gameparticipants`
--

DROP TABLE IF EXISTS `gameparticipants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gameparticipants` (
  `participant_id` int NOT NULL AUTO_INCREMENT,
  `session_id` int NOT NULL,
  `user_id` int NOT NULL,
  `score` int DEFAULT '0',
  PRIMARY KEY (`participant_id`),
  KEY `session_id` (`session_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `gameparticipants_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `gamesessions` (`session_id`) ON DELETE CASCADE,
  CONSTRAINT `gameparticipants_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gameparticipants`
--

LOCK TABLES `gameparticipants` WRITE;
/*!40000 ALTER TABLE `gameparticipants` DISABLE KEYS */;
/*!40000 ALTER TABLE `gameparticipants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gamesessions`
--

DROP TABLE IF EXISTS `gamesessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gamesessions` (
  `session_id` int NOT NULL AUTO_INCREMENT,
  `quiz_id` int NOT NULL,
  `host_id` int NOT NULL,
  `start_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `end_time` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`session_id`),
  KEY `quiz_id` (`quiz_id`),
  KEY `host_id` (`host_id`),
  CONSTRAINT `gamesessions_ibfk_1` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`quiz_id`) ON DELETE CASCADE,
  CONSTRAINT `gamesessions_ibfk_2` FOREIGN KEY (`host_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gamesessions`
--

LOCK TABLES `gamesessions` WRITE;
/*!40000 ALTER TABLE `gamesessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `gamesessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `otp`
--

DROP TABLE IF EXISTS `otp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `otp` (
  `opt_id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `otp` varchar(6) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`opt_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `otp`
--

LOCK TABLES `otp` WRITE;
/*!40000 ALTER TABLE `otp` DISABLE KEYS */;
/*!40000 ALTER TABLE `otp` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `question_type`
--

DROP TABLE IF EXISTS `question_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `question_type` (
  `question_type_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`question_type_id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `question_type`
--

LOCK TABLES `question_type` WRITE;
/*!40000 ALTER TABLE `question_type` DISABLE KEYS */;
INSERT INTO `question_type` VALUES (1,'Single Choice','Một lựa chọn duy nhất'),(2,'Multiple Choice','Lựa chọn nhiều câu trả lời'),(3,'Short Answer','Trả lời ngắn');
/*!40000 ALTER TABLE `question_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `questions`
--

DROP TABLE IF EXISTS `questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `questions` (
  `question_id` int NOT NULL AUTO_INCREMENT,
  `quiz_id` int NOT NULL,
  `question_text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `time_limit` int DEFAULT '60',
  `points` int DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `question_type_id` int NOT NULL,
  PRIMARY KEY (`question_id`),
  KEY `quiz_id` (`quiz_id`),
  KEY `fk_question_type` (`question_type_id`),
  CONSTRAINT `fk_question_type` FOREIGN KEY (`question_type_id`) REFERENCES `question_type` (`question_type_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`quiz_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questions`
--

LOCK TABLES `questions` WRITE;
/*!40000 ALTER TABLE `questions` DISABLE KEYS */;
INSERT INTO `questions` VALUES (1,5,'What is the capital of France?',60,1,'2025-04-20 03:00:00',1),(2,5,'Which of the following are programming languages?',90,2,'2025-04-20 03:05:00',1),(3,5,'Explain the concept of inheritance in OOP.',120,3,'2025-04-20 03:10:00',1),(4,5,'Thủ đô Việt Nam là ?',30,1,'2025-04-24 08:13:49',1),(5,5,'Thủ đô Việt Nam là ?',30,1,'2025-04-24 09:22:22',1),(6,5,'Thủ đô Việt Nam là ?',30,1,'2025-04-24 09:27:50',1),(7,5,'Thủ đô Việt Nam là ?',30,1,'2025-04-24 09:31:50',1),(8,5,'What is the capital of China?',60,1,'2025-04-25 13:21:41',1),(9,5,'What is the capital of China?',60,1,'2025-04-25 14:00:14',1),(10,5,'What is the capital of China?',60,1,'2025-04-25 14:40:36',1),(11,5,'What is the capital of China?',60,1,'2025-04-25 14:40:44',1),(13,5,'What is the capital of Cambodia?',60,1,'2025-04-25 14:41:17',1);
/*!40000 ALTER TABLE `questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quizzes`
--

DROP TABLE IF EXISTS `quizzes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quizzes` (
  `quiz_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `creator_id` int NOT NULL,
  `is_public` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `category_id` int DEFAULT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`quiz_id`),
  KEY `creator_id` (`creator_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `quizzes_ibfk_1` FOREIGN KEY (`creator_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `quizzes_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quizzes`
--

LOCK TABLES `quizzes` WRITE;
/*!40000 ALTER TABLE `quizzes` DISABLE KEYS */;
INSERT INTO `quizzes` VALUES (5,'General Knowledge Quiz','A quiz to test general knowledge.',7,1,'2025-04-24 07:30:16','2025-04-24 07:30:16',2,NULL),(6,'Quiz Test 1','Đây là quiz test',7,1,'2025-04-28 21:31:01','2025-04-28 21:31:01',1,NULL),(7,'Quiz Test 1','Đây là quiz test',7,1,'2025-04-28 22:06:05','2025-04-28 22:06:05',1,NULL),(8,'C++','c++',7,1,'2025-04-28 22:28:49','2025-04-28 22:28:49',1,NULL),(9,'C++','c++',7,1,'2025-04-28 22:29:12','2025-04-28 22:29:12',1,NULL),(10,'java','java',7,1,'2025-04-28 22:40:24','2025-04-28 22:40:24',1,NULL),(11,'c#','oop',7,1,'2025-04-28 22:51:39','2025-04-28 22:51:39',1,NULL),(12,'Facebook','123',7,1,'2025-04-28 22:54:22','2025-04-28 22:54:22',1,NULL),(13,'123','456',7,1,'2025-04-29 07:09:49','2025-04-29 07:09:49',1,NULL),(14,'Quiz Test','Đây là quiz test ngay 9',7,1,'2025-05-09 15:26:57','2025-05-09 15:26:57',1,NULL),(15,'c#','ngay 9',7,1,'2025-05-09 15:32:22','2025-05-09 15:32:22',1,NULL),(16,'ngaày 9','123',7,1,'2025-05-09 15:32:44','2025-05-09 15:32:44',1,NULL),(17,'ngay 91','qwe',7,1,'2025-05-09 15:35:41','2025-05-09 15:35:41',1,NULL),(18,'ngay 92','123',7,1,'2025-05-09 15:45:28','2025-05-09 15:45:28',1,NULL),(19,'ngày 93','a',7,1,'2025-05-09 15:46:39','2025-05-09 15:46:39',1,NULL),(20,'ngày 99','12345',7,1,'2025-05-09 16:41:48','2025-05-09 16:41:48',1,NULL),(21,'12345','1234567890',7,1,'2025-05-09 16:44:02','2025-05-09 16:44:02',1,NULL),(22,'098765432','ádfghjkl',7,1,'2025-05-09 16:50:39','2025-05-09 16:50:39',1,NULL),(23,'java','95',7,1,'2025-05-09 16:54:31','2025-05-09 16:54:31',1,NULL),(24,'Quiz Test','Đây là quiz test ngay 14',7,1,'2025-05-14 12:33:18','2025-05-14 12:33:18',1,NULL);
/*!40000 ALTER TABLE `quizzes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reports`
--

DROP TABLE IF EXISTS `reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reports` (
  `report_id` int NOT NULL AUTO_INCREMENT,
  `session_id` int NOT NULL,
  `participant_id` int NOT NULL,
  `total_score` int DEFAULT '0',
  `correct_answers` int DEFAULT '0',
  `incorrect_answers` int DEFAULT '0',
  PRIMARY KEY (`report_id`),
  KEY `session_id` (`session_id`),
  KEY `participant_id` (`participant_id`),
  CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `gamesessions` (`session_id`) ON DELETE CASCADE,
  CONSTRAINT `reports_ibfk_2` FOREIGN KEY (`participant_id`) REFERENCES `gameparticipants` (`participant_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reports`
--

LOCK TABLES `reports` WRITE;
/*!40000 ALTER TABLE `reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `userresponses`
--

DROP TABLE IF EXISTS `userresponses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userresponses` (
  `response_id` int NOT NULL AUTO_INCREMENT,
  `participant_id` int NOT NULL,
  `question_id` int NOT NULL,
  `answer_id` int NOT NULL,
  `is_correct` tinyint(1) DEFAULT '0',
  `response_time` int DEFAULT '0',
  PRIMARY KEY (`response_id`),
  KEY `participant_id` (`participant_id`),
  KEY `question_id` (`question_id`),
  KEY `answer_id` (`answer_id`),
  CONSTRAINT `userresponses_ibfk_1` FOREIGN KEY (`participant_id`) REFERENCES `gameparticipants` (`participant_id`) ON DELETE CASCADE,
  CONSTRAINT `userresponses_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `questions` (`question_id`) ON DELETE CASCADE,
  CONSTRAINT `userresponses_ibfk_3` FOREIGN KEY (`answer_id`) REFERENCES `answers` (`answer_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userresponses`
--

LOCK TABLES `userresponses` WRITE;
/*!40000 ALTER TABLE `userresponses` DISABLE KEYS */;
/*!40000 ALTER TABLE `userresponses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('user','admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (5,'tuminh123','tuminh123@gmail.com','$2b$10$Q1IaSt6xiWbr/wbJhArcXOpwZJNEKbBjXOh0uVwwO4Qm5ohFA9c1S','user','2025-04-08 05:37:52','2025-04-08 05:37:52'),(6,'rinrin241091','tudangm10@gmail.com','$2b$10$kbDq8D1PhXTX8I1LlYGiROLigkPuw1kekyWx/m7E7Mm/DSumip86O','user','2025-04-11 08:28:20','2025-04-11 08:28:20'),(7,'tuan','123@gmail.com','$2b$10$PdUqjl5DEJ1lwb5nc0bhKOt6bLxruIkUF1i95qVyFiJ2EnoiWVSr2','user','2025-04-23 12:15:17','2025-04-23 12:15:17');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-17 17:52:09
