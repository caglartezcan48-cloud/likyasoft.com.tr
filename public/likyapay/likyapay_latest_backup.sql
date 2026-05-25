

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



CREATE TABLE `cycles` (
  `id` varchar(50) NOT NULL,
  `amount` decimal(18,2) NOT NULL,
  `status` varchar(50) DEFAULT 'Bekliyor',
  `date` date NOT NULL,
  `commission` decimal(18,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



CREATE TABLE `sirius_cycles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cycle_hash` varchar(64) DEFAULT NULL,
  `cycle_code` varchar(64) DEFAULT NULL,
  `nodes` longtext DEFAULT NULL,
  `node_names` longtext DEFAULT NULL,
  `details` longtext NOT NULL CHECK (json_valid(`details`)),
  `total_volume` decimal(15,2) NOT NULL,
  `payment_status` longtext DEFAULT NULL CHECK (json_valid(`payment_status`)),
  `legal_status` longtext DEFAULT NULL CHECK (json_valid(`legal_status`)),
  `status` enum('detected','approved','processing','completed') DEFAULT 'detected',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cycle_code` (`cycle_code`),
  KEY `idx_sirius_cycles_status` (`status`),
  KEY `idx_sirius_cycles_cycle_code` (`cycle_code`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



CREATE TABLE `sirius_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `requester_id` int(11) NOT NULL,
  `target_tax_id` varchar(20) NOT NULL,
  `target_name` varchar(255) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `document_type` enum('invoice','check','bond','contract','other') DEFAULT 'invoice',
  `description` text DEFAULT NULL,
  `doc_path` varchar(255) DEFAULT NULL,
  `status` enum('pending','matched','completed','cancelled') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `requester_id` (`requester_id`),
  KEY `target_tax_id` (`target_tax_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



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
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

INSERT INTO system_logs VALUES("1","1","SIRIUS_START","Döngü süreci başlatıldı (ID: 1)","::1","2026-01-05 12:37:25");
INSERT INTO system_logs VALUES("2","1","SIRIUS_START","Döngü süreci başlatıldı (ID: 2)","::1","2026-01-05 12:37:32");
INSERT INTO system_logs VALUES("3","1","SIRIUS_START","Döngü süreci başlatıldı (ID: 1)","::1","2026-01-05 18:45:54");
INSERT INTO system_logs VALUES("4","1","SIRIUS_FINALIZE","Döngü tamamlandı ve hizmet bedelleri işlendi (ID: 1, Tutar: 8100 TL)","::1","2026-01-05 18:51:23");
INSERT INTO system_logs VALUES("5","1","SIRIUS_START","Döngü süreci başlatıldı (ID: 2)","::1","2026-01-05 19:19:47");
INSERT INTO system_logs VALUES("6","1","INVOICE_GEN","Otomatik TASLAK fatura oluşturuldu: Döngü #2 - Çeliksan A.Ş","::1","2026-01-05 19:23:29");
INSERT INTO system_logs VALUES("7","1","INVOICE_GEN","Otomatik TASLAK fatura oluşturuldu: Döngü #2 - Atlas Lojistik","::1","2026-01-05 19:23:30");
INSERT INTO system_logs VALUES("8","1","INVOICE_GEN","Otomatik TASLAK fatura oluşturuldu: Döngü #2 - Mega Yapı","::1","2026-01-05 19:23:30");
INSERT INTO system_logs VALUES("9","1","SIRIUS_FINALIZE","Döngü tamamlandı ve hizmet bedelleri işlendi (ID: 2, Tutar: 8100 TL)","::1","2026-01-05 19:23:30");
INSERT INTO system_logs VALUES("10","1","INVOICE_APPROVE","Fatura onaylandı ve cariye işlendi (ID: 10, User: 3)","::1","2026-01-05 19:32:22");
INSERT INTO system_logs VALUES("11","1","INVOICE_APPROVE","Fatura onaylandı ve cariye işlendi (ID: 9, User: 4)","::1","2026-01-05 19:32:30");
INSERT INTO system_logs VALUES("12","1","INVOICE_APPROVE","Fatura onaylandı ve cariye işlendi (ID: 8, User: 2)","::1","2026-01-05 19:32:38");
INSERT INTO system_logs VALUES("13","1","SIRIUS_START","Döngü süreci başlatıldı (ID: 3)","::1","2026-01-05 19:35:40");
INSERT INTO system_logs VALUES("14","1","INVOICE_GEN","Otomatik TASLAK fatura oluşturuldu: Döngü #3 - Atlas Lojistik","::1","2026-01-05 19:37:43");
INSERT INTO system_logs VALUES("15","1","INVOICE_GEN","Otomatik TASLAK fatura oluşturuldu: Döngü #3 - Mega Yapı","::1","2026-01-05 19:37:44");
INSERT INTO system_logs VALUES("16","1","INVOICE_GEN","Otomatik TASLAK fatura oluşturuldu: Döngü #3 - Çeliksan A.Ş","::1","2026-01-05 19:37:44");
INSERT INTO system_logs VALUES("17","1","SIRIUS_FINALIZE","Döngü tamamlandı ve hizmet bedelleri işlendi (ID: 3, Tutar: 7560 TL)","::1","2026-01-05 19:37:44");
INSERT INTO system_logs VALUES("18","1","INVOICE_APPROVE","Fatura onaylandı ve cariye işlendi (ID: 13, User: 2)","::1","2026-01-05 19:41:52");
INSERT INTO system_logs VALUES("19","1","INVOICE_APPROVE","Fatura onaylandı ve cariye işlendi (ID: 12, User: 3)","::1","2026-01-05 19:41:55");
INSERT INTO system_logs VALUES("20","1","INVOICE_APPROVE","Fatura onaylandı ve cariye işlendi (ID: 11, User: 4)","::1","2026-01-05 19:41:57");
INSERT INTO system_logs VALUES("21","1","SIRIUS_START","Döngü süreci başlatıldı (ID: 2)","::1","2026-01-06 12:39:31");
INSERT INTO system_logs VALUES("22","1","SIRIUS_START","Döngü süreci başlatıldı (ID: 3)","::1","2026-01-06 12:43:41");
INSERT INTO system_logs VALUES("23","1","INVOICE_GEN","Otomatik TASLAK fatura oluşturuldu: Döngü #3 - Atlas Lojistik","::1","2026-01-06 12:47:32");
INSERT INTO system_logs VALUES("24","1","INVOICE_GEN","Otomatik TASLAK fatura oluşturuldu: Döngü #3 - Mega Yapı","::1","2026-01-06 12:47:32");
INSERT INTO system_logs VALUES("25","1","INVOICE_GEN","Otomatik TASLAK fatura oluşturuldu: Döngü #3 - Çeliksan A.Ş","::1","2026-01-06 12:47:32");
INSERT INTO system_logs VALUES("26","1","SIRIUS_FINALIZE","Döngü tamamlandı ve hizmet bedelleri işlendi (ID: 3, Tutar: 10260 TL)","::1","2026-01-06 12:47:32");
INSERT INTO system_logs VALUES("27","1","INVOICE_APPROVE","Fatura onaylandı ve cariye işlendi (ID: 3, User: 2)","::1","2026-01-06 13:10:37");
INSERT INTO system_logs VALUES("28","1","INVOICE_APPROVE","Fatura onaylandı ve cariye işlendi (ID: 2, User: 3)","::1","2026-01-06 13:10:41");
INSERT INTO system_logs VALUES("29","1","INVOICE_APPROVE","Fatura onaylandı ve cariye işlendi (ID: 1, User: 4)","::1","2026-01-06 13:10:44");
INSERT INTO system_logs VALUES("30","1","SIRIUS_START","Döngü süreci başlatıldı (ID: 4)","::1","2026-01-06 13:11:02");
INSERT INTO system_logs VALUES("31","1","INVOICE_GEN","Otomatik TASLAK fatura oluşturuldu: Döngü #4 - Atlas Lojistik","::1","2026-01-06 13:13:11");
INSERT INTO system_logs VALUES("32","1","INVOICE_GEN","Otomatik TASLAK fatura oluşturuldu: Döngü #4 - Mega Yapı","::1","2026-01-06 13:13:11");
INSERT INTO system_logs VALUES("33","1","INVOICE_GEN","Otomatik TASLAK fatura oluşturuldu: Döngü #4 - Çeliksan A.Ş","::1","2026-01-06 13:13:11");
INSERT INTO system_logs VALUES("34","1","SIRIUS_FINALIZE","Döngü tamamlandı ve hizmet bedelleri işlendi (ID: 4, Tutar: 540 TL)","::1","2026-01-06 13:13:11");
INSERT INTO system_logs VALUES("35","1","INVOICE_APPROVE","Fatura onaylandı ve cariye işlendi (ID: 6, User: 2)","::1","2026-01-06 13:13:37");
INSERT INTO system_logs VALUES("36","1","INVOICE_APPROVE","Fatura onaylandı ve cariye işlendi (ID: 5, User: 3)","::1","2026-01-06 13:13:40");
INSERT INTO system_logs VALUES("37","1","INVOICE_APPROVE","Fatura onaylandı ve cariye işlendi (ID: 4, User: 4)","::1","2026-01-06 13:13:43");
INSERT INTO system_logs VALUES("38","1","SIRIUS_START","Döngü süreci başlatıldı (ID: 1)","::1","2026-01-06 14:46:50");
INSERT INTO system_logs VALUES("39","1","INVOICE_GEN","Otomatik TASLAK fatura oluşturuldu: Döngü #1 - Atlas Lojistik","::1","2026-01-06 14:50:13");
INSERT INTO system_logs VALUES("40","1","INVOICE_GEN","Otomatik TASLAK fatura oluşturuldu: Döngü #1 - Mega Yapı","::1","2026-01-06 14:50:14");
INSERT INTO system_logs VALUES("41","1","INVOICE_GEN","Otomatik TASLAK fatura oluşturuldu: Döngü #1 - Çeliksan A.Ş","::1","2026-01-06 14:50:14");
INSERT INTO system_logs VALUES("42","1","SIRIUS_FINALIZE","Döngü tamamlandı ve hizmet bedelleri işlendi (ID: 1, Tutar: 5400 TL)","::1","2026-01-06 14:50:14");
INSERT INTO system_logs VALUES("43","1","INVOICE_APPROVE","Fatura onaylandı ve cariye işlendi (ID: 3, User: 2)","::1","2026-01-06 14:50:34");
INSERT INTO system_logs VALUES("44","1","INVOICE_APPROVE","Fatura onaylandı ve cariye işlendi (ID: 2, User: 3)","::1","2026-01-06 14:50:38");
INSERT INTO system_logs VALUES("45","1","INVOICE_APPROVE","Fatura onaylandı ve cariye işlendi (ID: 1, User: 4)","::1","2026-01-06 14:50:41");
INSERT INTO system_logs VALUES("46","1","SIRIUS_START","Döngü süreci başlatıldı (ID: 2)","::1","2026-01-06 17:00:24");
INSERT INTO system_logs VALUES("47","1","INVOICE_GEN","Otomatik TASLAK fatura oluşturuldu: Döngü #2 - Çeliksan A.Ş","::1","2026-01-06 17:07:01");
INSERT INTO system_logs VALUES("48","1","INVOICE_GEN","Otomatik TASLAK fatura oluşturuldu: Döngü #2 - Atlas Lojistik","::1","2026-01-06 17:07:01");
INSERT INTO system_logs VALUES("49","1","INVOICE_GEN","Otomatik TASLAK fatura oluşturuldu: Döngü #2 - Mega Yapı","::1","2026-01-06 17:07:01");
INSERT INTO system_logs VALUES("50","1","SIRIUS_FINALIZE","Döngü tamamlandı ve hizmet bedelleri işlendi (ID: 2, Tutar: 4320 TL)","::1","2026-01-06 17:07:01");
INSERT INTO system_logs VALUES("51","1","INVOICE_APPROVE","Fatura onaylandı ve cariye işlendi (ID: 6, User: 3)","::1","2026-01-06 17:18:22");
INSERT INTO system_logs VALUES("52","1","INVOICE_APPROVE","Fatura onaylandı ve cariye işlendi (ID: 5, User: 4)","::1","2026-01-06 17:18:25");
INSERT INTO system_logs VALUES("53","1","INVOICE_APPROVE","Fatura onaylandı ve cariye işlendi (ID: 4, User: 2)","::1","2026-01-06 17:18:27");
INSERT INTO system_logs VALUES("54","1","ACCOUNTING_ADD","Yeni işlem eklendi (ID: 7): Satış Geliri - 20000 TL","::1","2026-01-07 11:22:57");
INSERT INTO system_logs VALUES("55","1","ACCOUNTING_DELETE","İşlem silindi (ID: 7)","::1","2026-01-07 11:29:30");
INSERT INTO system_logs VALUES("56","1","ACCOUNTING_ADD","Yeni işlem eklendi (ID: 8): Satış Geliri - 20000 TL","::1","2026-01-07 11:33:55");
INSERT INTO system_logs VALUES("57","1","ACCOUNTING_ADD","Yeni işlem eklendi (ID: 9): Satış Geliri - 20000 TL","::1","2026-01-07 11:42:35");
INSERT INTO system_logs VALUES("58","1","ACCOUNTING_DELETE","İşlem silindi (ID: 9)","::1","2026-01-07 11:48:36");
INSERT INTO system_logs VALUES("59","1","ACCOUNTING_DELETE","İşlem silindi (ID: 6)","::1","2026-01-07 11:48:39");
INSERT INTO system_logs VALUES("60","1","ACCOUNTING_DELETE","İşlem silindi (ID: 8)","::1","2026-01-07 11:48:41");
INSERT INTO system_logs VALUES("61","1","ACCOUNTING_DELETE","İşlem silindi (ID: 5)","::1","2026-01-07 11:48:43");
INSERT INTO system_logs VALUES("62","1","ACCOUNTING_DELETE","İşlem silindi (ID: 4)","::1","2026-01-07 11:48:46");
INSERT INTO system_logs VALUES("63","1","ACCOUNTING_DELETE","İşlem silindi (ID: 3)","::1","2026-01-07 11:48:48");
INSERT INTO system_logs VALUES("64","1","ACCOUNTING_DELETE","İşlem silindi (ID: 2)","::1","2026-01-07 11:48:50");
INSERT INTO system_logs VALUES("65","1","ACCOUNTING_DELETE","İşlem silindi (ID: 1)","::1","2026-01-07 11:48:52");


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
  `status` enum('draft','approved','cancelled') DEFAULT 'approved',
  PRIMARY KEY (`id`),
  KEY `idx_sys_tx_type` (`type`),
  KEY `idx_sys_tx_category` (`category`),
  KEY `idx_sys_tx_date` (`date`),
  KEY `idx_system_transactions_status` (`status`),
  KEY `idx_system_transactions_date` (`date`),
  KEY `idx_system_transactions_entity_name` (`entity_name`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



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
  KEY `idx_transactions_date` (`date`),
  CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO transactions VALUES("1","4","3","","","","debt","Mega Yapı","0.00","0000-00-00","Sirius (Tamamlandı)","yuklendi.pdf"," [Sirius Döngü #1 ile ödendi]","0000-00-00","2026-01-06 14:14:34");
INSERT INTO transactions VALUES("2","4","2","","","","credit","Çeliksan A.Ş","0.00","0000-00-00","Sirius (Tamamlandı)","yuklendi.pdf"," [Sirius #1 ile -50000 TL tahsil edildi - FIX] [Sirius Döngü #2 ile tahsil edildi]","0000-00-00","2026-01-06 14:14:51");
INSERT INTO transactions VALUES("3","2","3","","","","credit","Mega Yapı","0.00","0000-00-00","Sirius (Tamamlandı)","yuklendi.pdf"," [Sirius #1 ile -50000 TL tahsil edildi - FIX] [Sirius Döngü #2 ile tahsil edildi]","0000-00-00","2026-01-06 14:18:03");
INSERT INTO transactions VALUES("4","4","3","","","","debt","Mega Yapı","0.00","0000-00-00","Sirius (Tamamlandı)","yuklendi.pdf"," [Sirius Döngü #2 ile ödendi]","0000-00-00","2026-01-06 14:38:54");
INSERT INTO transactions VALUES("5","4","8","","","","debt","ayakkabıcı","15000.00","0000-00-00","pending","yuklendi.pdf","","0000-00-00","2026-01-06 14:42:50");
INSERT INTO transactions VALUES("6","2","","","","","debt","","1800.00","","approved","","Sirius Döngü #1 Hizmet Bedeli Faturası","2026-01-06","2026-01-06 14:50:34");
INSERT INTO transactions VALUES("7","3","","","","","debt","","1800.00","","approved","","Sirius Döngü #1 Hizmet Bedeli Faturası","2026-01-06","2026-01-06 14:50:38");
INSERT INTO transactions VALUES("8","4","","","","","debt","","1800.00","","approved","","Sirius Döngü #1 Hizmet Bedeli Faturası","2026-01-06","2026-01-06 14:50:41");
INSERT INTO transactions VALUES("9","4","3","","","","debt","Mega Yapı","1000.00","0000-00-00","Onaylandı","yuklendi.pdf"," [Sirius #2 ile -39000 TL düşüldü]","0000-00-00","2026-01-06 16:23:22");
INSERT INTO transactions VALUES("10","4","2","","","","credit","Çeliksan A.Ş","0.00","0000-00-00","Sirius (Tamamlandı)","yuklendi.pdf"," [Sirius Döngü #2 ile tahsil edildi]","0000-00-00","2026-01-06 16:23:44");
INSERT INTO transactions VALUES("11","2","3","","","","credit","Mega Yapı","5000.00","0000-00-00","Onaylandı","yuklendi.pdf"," [Sirius #2 ile -35000 TL tahsil edildi]","0000-00-00","2026-01-06 16:24:26");
INSERT INTO transactions VALUES("12","3","","","","","debt","","1440.00","","approved","","6102 Sayılı TTK Kapsamında Verilen Finansal Takas ve Mahsuplaşma Hizmet Bedeli (Sirius Döngü #2)","2026-01-06","2026-01-06 17:18:22");
INSERT INTO transactions VALUES("13","4","","","","","debt","","1440.00","","approved","","6102 Sayılı TTK Kapsamında Verilen Finansal Takas ve Mahsuplaşma Hizmet Bedeli (Sirius Döngü #2)","2026-01-06","2026-01-06 17:18:25");
INSERT INTO transactions VALUES("14","2","","","","","debt","","1440.00","","approved","","6102 Sayılı TTK Kapsamında Verilen Finansal Takas ve Mahsuplaşma Hizmet Bedeli (Sirius Döngü #2)","2026-01-06","2026-01-06 17:18:27");


CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `username` varchar(50) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
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
  `kep_address` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `tax_office` varchar(100) DEFAULT NULL,
  `mersis_no` varchar(50) DEFAULT NULL,
  `trade_registry_no` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_tax_id` (`tax_id`),
  KEY `idx_users_user_type` (`user_type`),
  KEY `idx_users_email` (`email`),
  KEY `idx_users_role` (`role`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO users VALUES("1","Yönetici","","admin@likyapay.com","","$2y$10$54.mu8XIcYXDfFslpOI3.uQGLgliyLhB.d4IVhlep03GMej0S.aPe","admin","company","","employee","Likya Pay Genel Merkez","","","Aktif","1234538935","Genel Ticaret","","Nilüfer Mah. Atatürk Cad. No:95 Antalya","2025-12-30 11:20:14","Levent Vergi Dairesi","000015","140025");
INSERT INTO users VALUES("2","Çeliksan A.Ş","celiksan	","celiksan@demo.com","5321112233","$2y$10$47Cvtt/g9oJlPS.feVkxt.jtZDesww8hjnPWCvsqR2j6fyDij7cbC","user","company","","customer","","","","Aktif","1233751415","	Sanayi	","","Nilüfer Mah. Atatürk Cad. No:27 İzmir","2026-01-05 18:20:29","","","");
INSERT INTO users VALUES("3","Mega Yapı","megayapi	","mega@demo.com","	5323334455","$2y$10$xTEgIpO5SI5X3BbvPLrd2OHEM17H6yvp3upCxXMMkTgQwx3hI/ntK","user","company","","customer","","","","Aktif","1232870124","	İnşaat	","","Çankaya Mah. Atatürk Cad. No:17 Bursa","2026-01-05 18:20:29","","","");
INSERT INTO users VALUES("4","Atlas Lojistik","admin@likyapay.com","atlas@demo.com","5322223344","$2y$10$XlQLG8UmxHFiiqMN.Fw1ge.D7JhQ1cVNKY0K.rdAjZrcfCMyESynK","user","company","{\"can_approve\":false,\"can_accounting\":false,\"can_settings\":false}","customer","","","","Aktif","1239099596","Lojistik","","Muratpaşa Mah. Atatürk Cad. No:48 Bursa","2026-01-05 18:21:35","","","");
INSERT INTO users VALUES("8","ayakkabıcı","","ayakkabıcı@ayakkabıcı","","$2y$10$AnD2YP7e891qrlBYmhFD8.WbqGKL6vfNhE635dLzdZ1hK3xhdmGOy","user","company","","customer","","","","Aktif","1231066258","Genel Ticaret","","Merkez Mah. Atatürk Cad. No:48 Antalya","2026-01-06 14:42:50","","","");
INSERT INTO users VALUES("9","bakkal","","bakkal@bakkal","(535) 698 58 47","$2y$10$bs6/wSsW69UhOOETeQGVReCLO96KRBrZBdg7hTZ9DNUsi.Zw5YqoW","user","company","","customer","","","","Aktif","1238717730","","","Kadıköy Mah. Atatürk Cad. No:53 İstanbul","2026-01-07 11:41:31","","","");
