-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: likyapay
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `accounting_records`
--

DROP TABLE IF EXISTS `accounting_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `accounting_records` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` enum('Gelir','Gider') NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `sub_category` varchar(100) DEFAULT NULL,
  `amount` decimal(18,2) NOT NULL,
  `description` text DEFAULT NULL,
  `related_user_id` int(11) DEFAULT NULL,
  `date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounting_records`
--

LOCK TABLES `accounting_records` WRITE;
/*!40000 ALTER TABLE `accounting_records` DISABLE KEYS */;
/*!40000 ALTER TABLE `accounting_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cycle_participants`
--

DROP TABLE IF EXISTS `cycle_participants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cycle_participants` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cycle_id` varchar(50) NOT NULL,
  `user_id` int(11) NOT NULL,
  `has_paid` tinyint(1) DEFAULT 0,
  `has_approved` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `cycle_id` (`cycle_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `cycle_participants_ibfk_1` FOREIGN KEY (`cycle_id`) REFERENCES `cycles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cycle_participants_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cycle_participants`
--

LOCK TABLES `cycle_participants` WRITE;
/*!40000 ALTER TABLE `cycle_participants` DISABLE KEYS */;
/*!40000 ALTER TABLE `cycle_participants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cycles`
--

DROP TABLE IF EXISTS `cycles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cycles` (
  `id` varchar(50) NOT NULL,
  `amount` decimal(18,2) NOT NULL,
  `status` varchar(50) DEFAULT 'Bekliyor',
  `date` date NOT NULL,
  `commission` decimal(18,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cycles`
--

LOCK TABLES `cycles` WRITE;
/*!40000 ALTER TABLE `cycles` DISABLE KEYS */;
/*!40000 ALTER TABLE `cycles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sirius_cycles`
--

DROP TABLE IF EXISTS `sirius_cycles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sirius_cycles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cycle_code` varchar(64) DEFAULT NULL,
  `node_names` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`node_names`)),
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`details`)),
  `total_volume` decimal(15,2) NOT NULL,
  `payment_status` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`payment_status`)),
  `legal_status` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`legal_status`)),
  `status` enum('detected','approved','processing','completed') DEFAULT 'detected',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `cycle_code` (`cycle_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sirius_cycles`
--

LOCK TABLES `sirius_cycles` WRITE;
/*!40000 ALTER TABLE `sirius_cycles` DISABLE KEYS */;
/*!40000 ALTER TABLE `sirius_cycles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sirius_requests`
--

DROP TABLE IF EXISTS `sirius_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sirius_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `requester_id` int(11) NOT NULL,
  `target_tax_id` varchar(20) NOT NULL,
  `target_name` varchar(255) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `document_type` enum('invoice','check','bond','contract','other') DEFAULT 'invoice',
  `description` text DEFAULT NULL,
  `status` enum('pending','matched','completed','cancelled') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `requester_id` (`requester_id`),
  KEY `target_tax_id` (`target_tax_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sirius_requests`
--

LOCK TABLES `sirius_requests` WRITE;
/*!40000 ALTER TABLE `sirius_requests` DISABLE KEYS */;
INSERT INTO `sirius_requests` VALUES (1,17,'9000000002','Sirius B Ltd.',5000.00,'invoice','Sirius Test Döngüsü','pending','2026-01-03 09:44:39'),(2,18,'9000000003','Sirius C Holding',5000.00,'invoice','Sirius Test Döngüsü','pending','2026-01-03 09:44:39'),(3,19,'9000000001','Sirius A A.Ş.',5000.00,'invoice','Sirius Test Döngüsü','pending','2026-01-03 09:44:39');
/*!40000 ALTER TABLE `sirius_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_logs`
--

DROP TABLE IF EXISTS `system_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `system_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `action` (`action`),
  KEY `created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_logs`
--

LOCK TABLES `system_logs` WRITE;
/*!40000 ALTER TABLE `system_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `system_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_transactions`
--

DROP TABLE IF EXISTS `system_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `system_transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` enum('income','expense') NOT NULL,
  `category` varchar(100) NOT NULL,
  `entity_name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  `date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `details` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_sys_tx_type` (`type`),
  KEY `idx_sys_tx_category` (`category`),
  KEY `idx_sys_tx_date` (`date`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_transactions`
--

LOCK TABLES `system_transactions` WRITE;
/*!40000 ALTER TABLE `system_transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `system_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `related_user_id` int(11) DEFAULT NULL,
  `party` varchar(150) NOT NULL,
  `party_tax_id` varchar(20) DEFAULT NULL,
  `doc_no` varchar(50) DEFAULT NULL,
  `type` enum('debt','credit') NOT NULL,
  `party_name` varchar(255) NOT NULL,
  `amount` decimal(18,2) NOT NULL,
  `due_date` date DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Bekliyor',
  `doc_path` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_related_user` (`related_user_id`),
  KEY `idx_transactions_user_id` (`user_id`),
  KEY `idx_transactions_related_user_id` (`related_user_id`),
  KEY `idx_transactions_status` (`status`),
  KEY `idx_transactions_type` (`type`),
  KEY `idx_transactions_created_at` (`created_at`),
  CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
INSERT INTO `transactions` VALUES (1,11,8,'',NULL,NULL,'debt','KASAP',50000.00,'2026-01-28','Onaylandı','yuklendi.pdf','fds','0000-00-00','2026-01-03 07:31:34'),(2,11,13,'',NULL,NULL,'credit','ayak',45000.00,'2026-01-06','Onaylandı','yuklendi.pdf','fd','0000-00-00','2026-01-03 07:32:26'),(5,1,15,'',NULL,NULL,'debt','Peynirci Baba',5000.00,'2026-02-02','pending','yuklendi.pdf','Aylık peynir tedariği faturası','0000-00-00','2026-01-03 07:56:20'),(6,9,13,'',NULL,NULL,'debt','ayak',0.00,'2026-01-08','Sirius (Tamamlandı)','yuklendi.pdf','FD (Sirius -45000) [Sirius Döngü #18 ile ödendi]','0000-00-00','2026-01-03 09:08:38'),(7,9,7,'',NULL,NULL,'credit','BAKKAL',66000.00,'2026-01-16','Onaylandı','yuklendi.pdf','','0000-00-00','2026-01-03 09:09:12'),(10,17,18,'',NULL,NULL,'debt','Sirius B Ltd.',0.00,NULL,'Sirius (Tamamlandı)',NULL,'Sirius Gerçek Test','0000-00-00','2026-01-03 09:49:59'),(11,18,19,'',NULL,NULL,'debt','Sirius C Holding',0.00,NULL,'Sirius (Tamamlandı)',NULL,'Sirius Gerçek Test','0000-00-00','2026-01-03 09:49:59'),(12,19,17,'',NULL,NULL,'debt','Sirius A A.Ş.',0.00,NULL,'Sirius (Tamamlandı)',NULL,'Sirius Gerçek Test','0000-00-00','2026-01-03 09:49:59'),(13,7,12,'',NULL,NULL,'credit','BB',49000.00,'0000-00-00','Onaylandı','yuklendi.pdf','','0000-00-00','2026-01-03 10:00:30'),(14,12,11,'',NULL,NULL,'credit','AC',59000.00,'0000-00-00','Onaylandı','yuklendi.pdf','','0000-00-00','2026-01-03 10:01:19'),(15,8,9,'',NULL,NULL,'debt','MANAV',77000.00,'0000-00-00','Onaylandı','yuklendi.pdf','','0000-00-00','2026-01-03 10:02:10'),(22,16,NULL,'',NULL,NULL,'credit','',50.00,NULL,'approved',NULL,'Sistem İşlemi: Personel Maaşı ()','2026-01-03','2026-01-03 15:48:42'),(23,13,NULL,'',NULL,NULL,'debt','',10000.00,NULL,'approved',NULL,'Sistem İşlemi: Satış Geliri ()','2026-01-03','2026-01-03 15:53:55'),(24,9,13,'',NULL,NULL,'debt','ayak',0.00,'0000-00-00','Sirius (Tamamlandı)','yuklendi.pdf',' [Sirius Döngü #20 ile ödendi]','0000-00-00','2026-01-03 16:15:32'),(25,9,13,'',NULL,NULL,'debt','ayak',40000.00,'0000-00-00','Onaylandı','yuklendi.pdf','','0000-00-00','2026-01-03 16:28:27');
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','user') DEFAULT 'user',
  `user_type` enum('company','supplier','employee') DEFAULT 'company',
  `permissions` text DEFAULT NULL,
  `type` enum('customer','supplier','employee') DEFAULT 'customer',
  `company` varchar(150) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `job_title` varchar(100) DEFAULT NULL,
  `status` enum('Aktif','Pasif','Ön Kayıt','İzinli') DEFAULT 'Ön Kayıt',
  `tax_id` varchar(20) DEFAULT NULL,
  `sector` varchar(100) DEFAULT 'Genel Ticaret',
  `address` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `tax_office` varchar(100) DEFAULT NULL,
  `mersis_no` varchar(50) DEFAULT NULL,
  `trade_registry_no` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_tax_id` (`tax_id`),
  KEY `idx_users_user_type` (`user_type`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Yönetici','admin@likyapay.com','$2y$10$54.mu8XIcYXDfFslpOI3.uQGLgliyLhB.d4IVhlep03GMej0S.aPe','admin','company',NULL,'employee','Likya Pay Genel Merkez',NULL,NULL,'Aktif',NULL,'Genel Ticaret','Merkez Mah. Barbaros Bulvarı No: 146 D: 20 İstanbul','2025-12-30 08:20:14','Levent Vergi Dairesi','000015','140025'),(7,'BAKKAL','BAKKAL@BAKKAL','$2y$10$yu94N1kjyxtNPWYBR3.Jref37Ao./0QVxFV8byTsonLjojfFDuXjO','user','company',NULL,'customer',NULL,NULL,NULL,'Aktif','123456789','Genel Ticaret','Merkez Mah. Bağdat Cad. No: 101 D: 1 İstanbul','2026-01-02 15:19:48','Levent Vergi Dairesi','012345678900015','409960'),(8,'KASAP','KASAP@KASAP','$2y$10$6DYJYT3GH.1A.DVLv.fkyOAgeMeqDmcpanOt9JTxbt9hJUA4eGlBq','user','company',NULL,'customer',NULL,NULL,NULL,'Aktif','2345678991','Genel Ticaret','Merkez Mah. Bağdat Cad. No: 140 D: 10 İstanbul','2026-01-02 15:25:14','Beşiktaş Vergi Dairesi','0234567899100015','365599'),(9,'MANAV','MANAV@MANAV','$2y$10$qYV5EOuEIwl/cUc1O8DIquYVj2XaAcng.qvfx3Bsh8gssSyYoXRva','user','company',NULL,'customer',NULL,NULL,NULL,'Aktif','78945612355','Genel Ticaret','Merkez Mah. Bağdat Cad. No: 28 D: 19 İstanbul','2026-01-02 15:27:00','Levent Vergi Dairesi','07894561235500015','428244'),(10,'KEÇE','KEÇE@KEÇE','$2y$10$9jpj32SYQ9AYd8MZjOOkuekZKzJb24YT7CqjUAzuOvqelBhanT.d2','user','company',NULL,'customer',NULL,NULL,NULL,'Aktif','547896547789','Genel Ticaret','Merkez Mah. Nispetiye Cad. No: 28 D: 20 İstanbul','2026-01-02 15:29:36','Levent Vergi Dairesi','054789654778900015','833663'),(11,'AC','AC@AC','$2y$10$R2GxhfwBFZb3QnlYH/Velei2xhq3LarFJS2cOYO.MwPNmnqaAn.ma','user','company',NULL,'customer',NULL,NULL,NULL,'Aktif','6548965523','Genel Ticaret','Merkez Mah. İstiklal Cad. No: 72 D: 13 İstanbul','2026-01-02 16:01:29','Kadıköy Vergi Dairesi','0654896552300015','931152'),(12,'BB','BB@BB','$2y$10$KfopeTvalyGiA6/jScCnYOtouVPw9KfoPr3enbns9q1VJb9fQxm46','user','company',NULL,'customer',NULL,NULL,NULL,'Aktif','75896632555','Genel Ticaret','Merkez Mah. İstiklal Cad. No: 40 D: 1 İstanbul','2026-01-02 16:12:19','Beyoğlu Vergi Dairesi','07589663255500015','386595'),(13,'ayak','ayak@ayak','$2y$10$yAHIHyQYQqve5E34xaa3XepoTFAHJx4sa09KuTKg7lnsJkK41ELNu','user','company','{}','customer',NULL,NULL,NULL,'Aktif','25436897655','Genel Ticaret','Merkez Mah. İstiklal Cad. No: 110 D: 19 İstanbul','2026-01-03 07:32:26','Zincirlikuyu Vergi Dairesi','02543689765500015','478333'),(14,'Test Güncellendi A.Ş.','bekleyen262@test.com','$2y$10$ONB40RVkMqt4R2o68aW1HOuwW9.RHiLMlCeNJalCqxD08JcuydgBu','user','company',NULL,'customer',NULL,NULL,NULL,'Aktif','9999994049','Genel Ticaret','Merkez Mah. İstiklal Cad. No: 38 D: 9 İstanbul','2026-01-03 07:33:07','Beşiktaş Vergi Dairesi','0999999404900015','418227'),(15,'Peynirci Baba','peynirci@baba.com','$2y$10$DyLy7uE62hPQrWsZAPB7QeJJoWZ/BcEvtxoNm94JWmbZYMGC2E8oi','user','company',NULL,'customer',NULL,NULL,NULL,'Pasif','1122334455','Genel Ticaret','Merkez Mah. Nispetiye Cad. No: 19 D: 1 İstanbul','2026-01-03 07:56:20','Kadıköy Vergi Dairesi','0112233445500015','696478'),(16,'ali','ali@ali','$2y$10$P.lUkDAxK8V3kAokBfgn0.l/0hfetmFYHu7sW1WwUT/x3rXE4V4am','admin','employee','{\"can_accounting\":true,\"can_approve\":true}','customer',NULL,NULL,NULL,'Aktif','11111111111111111111','Genel Ticaret','Merkez Mah. Büyükdere Cad. No: 78 D: 10 İstanbul','2026-01-03 08:32:37','Maslak Vergi Dairesi','01111111111111111111100015','971615'),(17,'Sirius A A.Ş.','siriusA@test.com','$2y$10$niU4ZHw6ARV5gK0HsmJsXOmjlRMxA2nW84rlzaYOZQtzUZIVswp/C','user','company',NULL,'customer',NULL,NULL,NULL,'Aktif','9000000001','Genel Ticaret','Merkez Mah. İstiklal Cad. No: 87 D: 19 İstanbul','2026-01-03 09:44:38','Beşiktaş Vergi Dairesi','0900000000100015','884522'),(18,'Sirius B Ltd.','siriusB@test.com','$2y$10$rLM.yXPC/R3.LOuTzdkzneGBJ4j.IllrpZ06lUkbKxL0ci.50m9/W','user','company',NULL,'customer',NULL,NULL,NULL,'Aktif','9000000002','Genel Ticaret','Merkez Mah. Bağdat Cad. No: 73 D: 6 İstanbul','2026-01-03 09:44:39','Zincirlikuyu Vergi Dairesi','0900000000200015','716229'),(19,'Sirius C Holding','siriusC@test.com','$2y$10$E1zz80RK7FaWAXopuAkVnu7NauUPwXbFhEJUWQUktviD4Q2pTtu3O','user','company',NULL,'customer',NULL,NULL,NULL,'Aktif','9000000003','Genel Ticaret','Merkez Mah. Bağdat Cad. No: 141 D: 16 İstanbul','2026-01-03 09:44:39','Beşiktaş Vergi Dairesi','0900000000300015','918607');
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

-- Dump completed on 2026-01-03 22:22:55
