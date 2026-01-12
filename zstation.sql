/*
 Navicat Premium Dump SQL

 Source Server         : test
 Source Server Type    : MySQL
 Source Server Version : 100432 (10.4.32-MariaDB)
 Source Host           : localhost:3306
 Source Schema         : zstation

 Target Server Type    : MySQL
 Target Server Version : 100432 (10.4.32-MariaDB)
 File Encoding         : 65001

 Date: 10/01/2026 19:47:11
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for cache
-- ----------------------------
DROP TABLE IF EXISTS `cache`;
CREATE TABLE `cache`  (
  `key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of cache
-- ----------------------------

-- ----------------------------
-- Table structure for cache_locks
-- ----------------------------
DROP TABLE IF EXISTS `cache_locks`;
CREATE TABLE `cache_locks`  (
  `key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of cache_locks
-- ----------------------------

-- ----------------------------
-- Table structure for customers
-- ----------------------------
DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of customers
-- ----------------------------

-- ----------------------------
-- Table structure for failed_jobs
-- ----------------------------
DROP TABLE IF EXISTS `failed_jobs`;
CREATE TABLE `failed_jobs`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `failed_jobs_uuid_unique`(`uuid` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of failed_jobs
-- ----------------------------

-- ----------------------------
-- Table structure for game_pricings
-- ----------------------------
DROP TABLE IF EXISTS `game_pricings`;
CREATE TABLE `game_pricings`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `game_id` bigint UNSIGNED NOT NULL,
  `pricing_mode_id` bigint UNSIGNED NOT NULL,
  `duration_minutes` int NOT NULL,
  `price` decimal(8, 2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `game_pricings_game_id_foreign`(`game_id` ASC) USING BTREE,
  INDEX `game_pricings_pricing_mode_id_foreign`(`pricing_mode_id` ASC) USING BTREE,
  CONSTRAINT `game_pricings_game_id_foreign` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `game_pricings_pricing_mode_id_foreign` FOREIGN KEY (`pricing_mode_id`) REFERENCES `pricing_modes` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 32 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of game_pricings
-- ----------------------------
INSERT INTO `game_pricings` VALUES (2, 1, 1, 30, 10.00, '2026-01-02 20:00:02', '2026-01-03 13:13:23');
INSERT INTO `game_pricings` VALUES (3, 1, 1, 60, 20.00, '2026-01-02 20:00:02', '2026-01-03 13:13:23');
INSERT INTO `game_pricings` VALUES (4, 1, 1, 120, 45.00, '2026-01-02 20:00:02', '2026-01-02 20:00:02');
INSERT INTO `game_pricings` VALUES (5, 1, 1, 180, 60.00, '2026-01-02 20:00:02', '2026-01-02 20:00:02');
INSERT INTO `game_pricings` VALUES (6, 2, 1, 30, 10.00, '2026-01-02 20:00:02', '2026-01-03 13:13:23');
INSERT INTO `game_pricings` VALUES (7, 2, 1, 60, 20.00, '2026-01-02 20:00:02', '2026-01-03 13:13:23');
INSERT INTO `game_pricings` VALUES (8, 2, 1, 120, 45.00, '2026-01-02 20:00:02', '2026-01-02 20:00:02');
INSERT INTO `game_pricings` VALUES (9, 2, 1, 180, 60.00, '2026-01-02 20:00:02', '2026-01-02 20:00:02');
INSERT INTO `game_pricings` VALUES (10, 3, 1, 30, 10.00, '2026-01-02 20:00:02', '2026-01-03 13:13:23');
INSERT INTO `game_pricings` VALUES (11, 3, 1, 60, 20.00, '2026-01-02 20:00:02', '2026-01-03 13:13:23');
INSERT INTO `game_pricings` VALUES (12, 3, 1, 120, 45.00, '2026-01-02 20:00:02', '2026-01-02 20:00:02');
INSERT INTO `game_pricings` VALUES (13, 3, 1, 180, 60.00, '2026-01-02 20:00:02', '2026-01-02 20:00:02');
INSERT INTO `game_pricings` VALUES (14, 4, 1, 30, 10.00, '2026-01-02 20:00:02', '2026-01-03 13:13:23');
INSERT INTO `game_pricings` VALUES (15, 4, 1, 60, 20.00, '2026-01-02 20:00:02', '2026-01-03 13:13:23');
INSERT INTO `game_pricings` VALUES (16, 4, 1, 120, 45.00, '2026-01-02 20:00:02', '2026-01-02 20:00:02');
INSERT INTO `game_pricings` VALUES (17, 4, 1, 180, 60.00, '2026-01-02 20:00:02', '2026-01-02 20:00:02');
INSERT INTO `game_pricings` VALUES (18, 5, 1, 30, 10.00, '2026-01-02 20:00:02', '2026-01-03 13:13:23');
INSERT INTO `game_pricings` VALUES (19, 5, 1, 60, 20.00, '2026-01-02 20:00:02', '2026-01-03 13:13:23');
INSERT INTO `game_pricings` VALUES (20, 5, 1, 120, 45.00, '2026-01-02 20:00:02', '2026-01-02 20:00:02');
INSERT INTO `game_pricings` VALUES (21, 5, 1, 180, 60.00, '2026-01-02 20:00:02', '2026-01-02 20:00:02');
INSERT INTO `game_pricings` VALUES (22, 6, 1, 30, 10.00, '2026-01-02 20:00:02', '2026-01-03 13:13:23');
INSERT INTO `game_pricings` VALUES (23, 6, 1, 60, 20.00, '2026-01-02 20:00:02', '2026-01-03 13:13:23');
INSERT INTO `game_pricings` VALUES (24, 6, 1, 120, 45.00, '2026-01-02 20:00:02', '2026-01-02 20:00:02');
INSERT INTO `game_pricings` VALUES (25, 6, 1, 180, 60.00, '2026-01-02 20:00:02', '2026-01-02 20:00:02');
INSERT INTO `game_pricings` VALUES (26, 1, 1, 6, 6.00, '2026-01-03 13:13:23', '2026-01-03 13:13:23');
INSERT INTO `game_pricings` VALUES (27, 2, 1, 6, 6.00, '2026-01-03 13:13:23', '2026-01-03 13:13:23');
INSERT INTO `game_pricings` VALUES (28, 3, 1, 6, 6.00, '2026-01-03 13:13:23', '2026-01-03 13:13:23');
INSERT INTO `game_pricings` VALUES (29, 4, 1, 6, 6.00, '2026-01-03 13:13:23', '2026-01-03 13:13:23');
INSERT INTO `game_pricings` VALUES (30, 5, 1, 6, 6.00, '2026-01-03 13:13:23', '2026-01-03 13:13:23');
INSERT INTO `game_pricings` VALUES (31, 6, 1, 6, 6.00, '2026-01-03 13:13:23', '2026-01-03 13:13:23');

-- ----------------------------
-- Table structure for game_sessions
-- ----------------------------
DROP TABLE IF EXISTS `game_sessions`;
CREATE TABLE `game_sessions`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `machine_id` bigint UNSIGNED NOT NULL,
  `game_id` bigint UNSIGNED NOT NULL,
  `pricing_mode_id` bigint UNSIGNED NOT NULL,
  `pricing_reference_id` bigint UNSIGNED NOT NULL,
  `customer_id` bigint UNSIGNED NULL DEFAULT NULL,
  `start_time` timestamp NULL DEFAULT NULL,
  `ended_at` timestamp NULL DEFAULT NULL,
  `end_time` timestamp NULL DEFAULT NULL,
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `computed_price` decimal(8, 2) NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `game_sessions_machine_id_foreign`(`machine_id` ASC) USING BTREE,
  INDEX `game_sessions_game_id_foreign`(`game_id` ASC) USING BTREE,
  INDEX `game_sessions_pricing_mode_id_foreign`(`pricing_mode_id` ASC) USING BTREE,
  INDEX `game_sessions_pricing_reference_id_foreign`(`pricing_reference_id` ASC) USING BTREE,
  CONSTRAINT `game_sessions_game_id_foreign` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `game_sessions_machine_id_foreign` FOREIGN KEY (`machine_id`) REFERENCES `machines` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `game_sessions_pricing_mode_id_foreign` FOREIGN KEY (`pricing_mode_id`) REFERENCES `pricing_modes` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `game_sessions_pricing_reference_id_foreign` FOREIGN KEY (`pricing_reference_id`) REFERENCES `game_pricings` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 48 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of game_sessions
-- ----------------------------
INSERT INTO `game_sessions` VALUES (1, 1, 1, 1, 2, NULL, '2026-01-02 20:07:05', '2026-01-02 20:07:13', NULL, 'completed', 15.00, '2026-01-02 20:07:05', '2026-01-02 20:07:13');
INSERT INTO `game_sessions` VALUES (2, 2, 1, 1, 3, NULL, '2026-01-02 20:07:44', '2026-01-02 20:07:50', NULL, 'completed', 25.00, '2026-01-02 20:07:44', '2026-01-02 20:07:50');
INSERT INTO `game_sessions` VALUES (3, 1, 1, 1, 2, NULL, '2026-01-02 20:22:23', '2026-01-02 20:22:32', NULL, 'completed', 15.00, '2026-01-02 20:22:23', '2026-01-02 20:22:32');
INSERT INTO `game_sessions` VALUES (4, 1, 4, 1, 14, NULL, '2026-01-02 20:37:17', '2026-01-02 20:43:26', NULL, 'completed', 15.00, '2026-01-02 20:37:17', '2026-01-02 20:43:26');
INSERT INTO `game_sessions` VALUES (5, 1, 1, 1, 2, NULL, '2026-01-02 20:44:28', '2026-01-02 20:52:24', NULL, 'completed', 15.00, '2026-01-02 20:44:28', '2026-01-02 20:52:24');
INSERT INTO `game_sessions` VALUES (6, 2, 2, 1, 6, NULL, '2026-01-02 20:44:35', '2026-01-02 20:52:13', NULL, 'completed', 15.00, '2026-01-02 20:44:35', '2026-01-02 20:52:13');
INSERT INTO `game_sessions` VALUES (7, 1, 1, 1, 2, NULL, '2026-01-02 22:08:06', '2026-01-02 22:08:48', NULL, 'completed', 15.00, '2026-01-02 22:08:06', '2026-01-02 22:08:48');
INSERT INTO `game_sessions` VALUES (8, 1, 1, 1, 2, NULL, '2026-01-02 22:09:54', '2026-01-02 22:20:35', NULL, 'completed', 15.00, '2026-01-02 22:09:54', '2026-01-02 22:20:35');
INSERT INTO `game_sessions` VALUES (9, 1, 1, 1, 2, NULL, '2026-01-03 12:36:02', '2026-01-03 12:36:22', NULL, 'completed', 15.00, '2026-01-03 12:36:02', '2026-01-03 12:36:22');
INSERT INTO `game_sessions` VALUES (10, 1, 4, 1, 14, NULL, '2026-01-03 12:47:48', '2026-01-03 12:48:00', NULL, 'completed', 15.00, '2026-01-03 12:47:48', '2026-01-03 12:48:00');
INSERT INTO `game_sessions` VALUES (11, 1, 4, 1, 14, NULL, '2026-01-03 13:05:23', '2026-01-03 13:05:39', NULL, 'completed', 15.00, '2026-01-03 13:05:23', '2026-01-03 13:05:39');
INSERT INTO `game_sessions` VALUES (12, 1, 5, 1, 19, NULL, '2026-01-03 13:07:24', '2026-01-03 13:07:34', NULL, 'completed', 25.00, '2026-01-03 13:07:24', '2026-01-03 13:07:34');
INSERT INTO `game_sessions` VALUES (13, 1, 3, 1, 28, NULL, '2026-01-03 13:20:15', '2026-01-03 13:20:25', NULL, 'completed', 6.00, '2026-01-03 13:20:15', '2026-01-03 13:20:25');
INSERT INTO `game_sessions` VALUES (14, 1, 3, 1, 28, NULL, '2026-01-03 13:21:33', '2026-01-03 13:23:47', NULL, 'completed', 6.00, '2026-01-03 13:21:33', '2026-01-03 13:23:47');
INSERT INTO `game_sessions` VALUES (15, 2, 3, 1, 11, NULL, '2026-01-03 13:21:52', '2026-01-03 13:24:31', NULL, 'completed', 20.00, '2026-01-03 13:21:52', '2026-01-03 13:24:31');
INSERT INTO `game_sessions` VALUES (16, 3, 3, 1, 13, NULL, '2026-01-03 13:22:02', '2026-01-03 13:24:41', NULL, 'completed', 60.00, '2026-01-03 13:22:02', '2026-01-03 13:24:41');
INSERT INTO `game_sessions` VALUES (17, 2, 3, 1, 10, NULL, '2026-01-03 13:25:43', '2026-01-03 13:28:05', NULL, 'completed', 10.00, '2026-01-03 13:25:43', '2026-01-03 13:28:05');
INSERT INTO `game_sessions` VALUES (18, 1, 2, 1, 27, NULL, '2026-01-03 13:34:08', '2026-01-03 13:56:56', NULL, 'completed', 6.00, '2026-01-03 13:34:08', '2026-01-03 13:56:56');
INSERT INTO `game_sessions` VALUES (19, 2, 3, 1, 11, NULL, '2026-01-03 13:34:18', '2026-01-03 13:34:29', NULL, 'completed', 20.00, '2026-01-03 13:34:18', '2026-01-03 13:34:29');
INSERT INTO `game_sessions` VALUES (20, 1, 1, 1, 3, NULL, '2026-01-03 13:37:54', '2026-01-03 13:40:57', NULL, 'completed', 20.00, '2026-01-03 13:37:54', '2026-01-03 13:40:57');
INSERT INTO `game_sessions` VALUES (21, 2, 2, 1, 6, NULL, '2026-01-03 13:43:06', '2026-01-03 13:49:27', NULL, 'completed', 10.00, '2026-01-03 13:43:06', '2026-01-03 13:49:27');
INSERT INTO `game_sessions` VALUES (22, 3, 4, 1, 15, NULL, '2026-01-03 13:43:27', '2026-01-03 13:44:56', NULL, 'completed', 20.00, '2026-01-03 13:43:27', '2026-01-03 13:44:56');
INSERT INTO `game_sessions` VALUES (23, 1, 1, 1, 26, NULL, '2026-01-03 13:51:07', '2026-01-03 13:51:52', NULL, 'completed', 6.00, '2026-01-03 13:51:07', '2026-01-03 13:51:52');
INSERT INTO `game_sessions` VALUES (24, 2, 4, 1, 29, NULL, '2026-01-03 13:53:01', '2026-01-03 13:53:07', NULL, 'completed', 6.00, '2026-01-03 13:53:01', '2026-01-03 13:53:07');
INSERT INTO `game_sessions` VALUES (25, 2, 2, 1, 27, NULL, '2026-01-03 13:54:21', '2026-01-03 13:54:26', NULL, 'completed', 6.00, '2026-01-03 13:54:21', '2026-01-03 13:54:26');
INSERT INTO `game_sessions` VALUES (26, 1, 1, 1, 26, NULL, '2026-01-03 13:59:46', '2026-01-03 14:03:27', NULL, 'completed', 6.00, '2026-01-03 13:59:46', '2026-01-03 14:03:27');
INSERT INTO `game_sessions` VALUES (27, 2, 2, 1, 6, NULL, '2026-01-03 13:59:55', '2026-01-03 14:00:56', NULL, 'completed', 10.00, '2026-01-03 13:59:55', '2026-01-03 14:00:56');
INSERT INTO `game_sessions` VALUES (28, 2, 1, 1, 3, NULL, '2026-01-03 14:01:25', '2026-01-03 14:01:59', NULL, 'completed', 20.00, '2026-01-03 14:01:25', '2026-01-03 14:01:59');
INSERT INTO `game_sessions` VALUES (29, 2, 2, 1, 6, NULL, '2026-01-03 14:02:13', '2026-01-03 14:03:17', NULL, 'completed', 10.00, '2026-01-03 14:02:13', '2026-01-03 14:03:17');
INSERT INTO `game_sessions` VALUES (30, 2, 4, 1, 14, NULL, '2026-01-03 14:03:46', '2026-01-03 14:03:53', NULL, 'completed', NULL, '2026-01-03 14:03:46', '2026-01-03 14:03:53');
INSERT INTO `game_sessions` VALUES (31, 1, 1, 1, 3, NULL, '2026-01-03 14:03:54', '2026-01-03 14:07:04', NULL, 'completed', 20.00, '2026-01-03 14:03:54', '2026-01-03 14:07:04');
INSERT INTO `game_sessions` VALUES (32, 2, 2, 1, 6, NULL, '2026-01-03 14:07:18', '2026-01-03 14:13:46', NULL, 'completed', 10.00, '2026-01-03 14:07:18', '2026-01-03 14:13:46');
INSERT INTO `game_sessions` VALUES (33, 3, 1, 1, 26, NULL, '2026-01-03 14:07:25', '2026-01-03 14:13:41', NULL, 'completed', 6.00, '2026-01-03 14:07:25', '2026-01-03 14:13:41');
INSERT INTO `game_sessions` VALUES (34, 1, 4, 1, 15, NULL, '2026-01-03 14:07:32', '2026-01-03 14:13:45', NULL, 'completed', 20.00, '2026-01-03 14:07:32', '2026-01-03 14:13:45');
INSERT INTO `game_sessions` VALUES (35, 4, 6, 1, 24, NULL, '2026-01-03 14:07:41', '2026-01-03 14:13:52', NULL, 'completed', 45.00, '2026-01-03 14:07:41', '2026-01-03 14:13:52');
INSERT INTO `game_sessions` VALUES (36, 5, 3, 1, 13, NULL, '2026-01-03 14:07:50', '2026-01-03 14:13:57', NULL, 'completed', 60.00, '2026-01-03 14:07:50', '2026-01-03 14:13:57');
INSERT INTO `game_sessions` VALUES (37, 1, 1, 1, 26, NULL, '2026-01-03 20:44:21', '2026-01-03 20:46:29', NULL, 'completed', 6.00, '2026-01-03 20:44:21', '2026-01-03 20:46:29');
INSERT INTO `game_sessions` VALUES (38, 2, 1, 1, 2, NULL, '2026-01-03 20:44:33', '2026-01-03 20:44:42', NULL, 'completed', 10.00, '2026-01-03 20:44:33', '2026-01-03 20:44:42');
INSERT INTO `game_sessions` VALUES (39, 2, 4, 1, 15, NULL, '2026-01-03 20:46:42', '2026-01-03 20:49:17', NULL, 'completed', 20.00, '2026-01-03 20:46:42', '2026-01-03 20:49:17');
INSERT INTO `game_sessions` VALUES (40, 1, 2, 1, 27, NULL, '2026-01-03 20:49:36', '2026-01-03 21:00:26', NULL, 'completed', 6.00, '2026-01-03 20:49:36', '2026-01-03 21:00:26');
INSERT INTO `game_sessions` VALUES (41, 1, 3, 1, 28, NULL, '2026-01-03 21:00:47', '2026-01-03 21:06:58', NULL, 'completed', 6.00, '2026-01-03 21:00:47', '2026-01-03 21:06:58');
INSERT INTO `game_sessions` VALUES (42, 2, 2, 1, 6, NULL, '2026-01-03 21:00:57', '2026-01-03 21:11:57', NULL, 'completed', 10.00, '2026-01-03 21:00:57', '2026-01-03 21:11:57');
INSERT INTO `game_sessions` VALUES (43, 3, 4, 1, 16, NULL, '2026-01-03 21:01:12', '2026-01-03 21:02:12', NULL, 'completed', 45.00, '2026-01-03 21:01:12', '2026-01-03 21:02:12');
INSERT INTO `game_sessions` VALUES (44, 1, 3, 1, 11, NULL, '2026-01-03 21:11:25', '2026-01-03 21:11:34', NULL, 'completed', 20.00, '2026-01-03 21:11:25', '2026-01-03 21:11:34');
INSERT INTO `game_sessions` VALUES (45, 2, 2, 1, 27, NULL, '2026-01-03 21:11:57', '2026-01-03 21:18:03', NULL, 'completed', 6.00, '2026-01-03 21:11:57', '2026-01-03 21:18:03');
INSERT INTO `game_sessions` VALUES (46, 1, 2, 1, 6, NULL, '2026-01-05 10:51:04', '2026-01-05 10:51:14', NULL, 'completed', 10.00, '2026-01-05 10:51:04', '2026-01-05 10:51:14');
INSERT INTO `game_sessions` VALUES (47, 1, 1, 1, 26, NULL, '2026-01-10 13:03:33', '2026-01-10 13:11:15', NULL, 'completed', 6.00, '2026-01-10 13:03:33', '2026-01-10 13:11:15');

-- ----------------------------
-- Table structure for game_types
-- ----------------------------
DROP TABLE IF EXISTS `game_types`;
CREATE TABLE `game_types`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of game_types
-- ----------------------------
INSERT INTO `game_types` VALUES (1, 'PS5', '2026-01-02 19:56:36', '2026-01-02 19:56:36');

-- ----------------------------
-- Table structure for games
-- ----------------------------
DROP TABLE IF EXISTS `games`;
CREATE TABLE `games`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `game_type_id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `games_game_type_id_foreign`(`game_type_id` ASC) USING BTREE,
  CONSTRAINT `games_game_type_id_foreign` FOREIGN KEY (`game_type_id`) REFERENCES `game_types` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of games
-- ----------------------------
INSERT INTO `games` VALUES (1, 1, 'FIFA 24', 1, '2026-01-02 19:57:54', '2026-01-10 15:49:00');
INSERT INTO `games` VALUES (2, 1, 'Call of Duty', 1, '2026-01-02 20:00:02', '2026-01-10 15:49:00');
INSERT INTO `games` VALUES (3, 1, 'Fortnite', 1, '2026-01-02 20:00:02', '2026-01-10 15:49:00');
INSERT INTO `games` VALUES (4, 1, 'GTA V', 1, '2026-01-02 20:00:02', '2026-01-10 15:49:00');
INSERT INTO `games` VALUES (5, 1, 'Spider-Man', 1, '2026-01-02 20:00:02', '2026-01-10 15:49:00');
INSERT INTO `games` VALUES (6, 1, 'God of War', 1, '2026-01-02 20:00:02', '2026-01-10 15:49:00');

-- ----------------------------
-- Table structure for job_batches
-- ----------------------------
DROP TABLE IF EXISTS `job_batches`;
CREATE TABLE `job_batches`  (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `cancelled_at` int NULL DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of job_batches
-- ----------------------------

-- ----------------------------
-- Table structure for jobs
-- ----------------------------
DROP TABLE IF EXISTS `jobs`;
CREATE TABLE `jobs`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint UNSIGNED NOT NULL,
  `reserved_at` int UNSIGNED NULL DEFAULT NULL,
  `available_at` int UNSIGNED NOT NULL,
  `created_at` int UNSIGNED NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `jobs_queue_index`(`queue` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of jobs
-- ----------------------------

-- ----------------------------
-- Table structure for machines
-- ----------------------------
DROP TABLE IF EXISTS `machines`;
CREATE TABLE `machines`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('available','in_session','maintenance') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'available',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of machines
-- ----------------------------
INSERT INTO `machines` VALUES (1, 'PS5 - Station 1', 'available', '2026-01-02 19:54:55', '2026-01-10 13:11:15');
INSERT INTO `machines` VALUES (2, 'PS5 - Station 2', 'available', '2026-01-02 19:54:55', '2026-01-03 21:18:03');
INSERT INTO `machines` VALUES (3, 'PS5 - Station 3', 'available', '2026-01-02 19:54:55', '2026-01-03 21:02:12');
INSERT INTO `machines` VALUES (4, 'PS5 - Station 4', 'available', '2026-01-02 19:54:55', '2026-01-03 14:13:52');
INSERT INTO `machines` VALUES (5, 'PS5 - VIP 1', 'available', '2026-01-02 19:54:55', '2026-01-03 14:13:57');
INSERT INTO `machines` VALUES (6, 'PS5 - VIP 2', 'available', '2026-01-02 19:54:55', '2026-01-02 19:54:55');

-- ----------------------------
-- Table structure for migrations
-- ----------------------------
DROP TABLE IF EXISTS `migrations`;
CREATE TABLE `migrations`  (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 18 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of migrations
-- ----------------------------
INSERT INTO `migrations` VALUES (1, '0001_01_01_000000_create_users_table', 1);
INSERT INTO `migrations` VALUES (2, '0001_01_01_000001_create_cache_table', 1);
INSERT INTO `migrations` VALUES (3, '0001_01_01_000002_create_jobs_table', 1);
INSERT INTO `migrations` VALUES (4, '2025_12_12_105058_create_machines_table', 1);
INSERT INTO `migrations` VALUES (5, '2025_12_12_110054_create_game_types_table', 1);
INSERT INTO `migrations` VALUES (6, '2025_12_12_110101_create_games_table', 1);
INSERT INTO `migrations` VALUES (7, '2025_12_12_110107_create_pricing_modes_table', 1);
INSERT INTO `migrations` VALUES (8, '2025_12_12_110115_create_game_pricings_table', 1);
INSERT INTO `migrations` VALUES (9, '2025_12_12_110121_create_customers_table', 1);
INSERT INTO `migrations` VALUES (10, '2025_12_12_110129_create_game_sessions_table', 1);
INSERT INTO `migrations` VALUES (11, '2025_12_12_134738_create_personal_access_tokens_table', 1);
INSERT INTO `migrations` VALUES (12, '2025_12_16_135856_add_ended_at_to_game_sessions_table', 1);
INSERT INTO `migrations` VALUES (13, '2025_12_16_201421_remove_end_time_from_game_sessions_table', 1);
INSERT INTO `migrations` VALUES (14, '2025_12_17_125055_create_payments_table_complete', 1);
INSERT INTO `migrations` VALUES (15, '2025_12_17_211942_add_role_to_users_table', 1);
INSERT INTO `migrations` VALUES (16, '2026_01_03_221258_create_products_table', 2);
INSERT INTO `migrations` VALUES (17, '2026_01_03_221534_create_product_sales_table', 2);

-- ----------------------------
-- Table structure for password_reset_tokens
-- ----------------------------
DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE `password_reset_tokens`  (
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of password_reset_tokens
-- ----------------------------

-- ----------------------------
-- Table structure for payments
-- ----------------------------
DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `session_id` bigint UNSIGNED NOT NULL,
  `amount` decimal(8, 2) NOT NULL,
  `amount_given` decimal(8, 2) NULL DEFAULT NULL,
  `change_given` decimal(8, 2) NOT NULL DEFAULT 0.00,
  `payment_method` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'cash',
  `payment_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  `staff_id` bigint UNSIGNED NULL DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `payments_session_id_foreign`(`session_id` ASC) USING BTREE,
  INDEX `payments_staff_id_foreign`(`staff_id` ASC) USING BTREE,
  INDEX `payments_payment_date_index`(`payment_date` ASC) USING BTREE,
  INDEX `payments_payment_date_payment_method_index`(`payment_date` ASC, `payment_method` ASC) USING BTREE,
  CONSTRAINT `payments_session_id_foreign` FOREIGN KEY (`session_id`) REFERENCES `game_sessions` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `payments_staff_id_foreign` FOREIGN KEY (`staff_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 23 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of payments
-- ----------------------------
INSERT INTO `payments` VALUES (1, 2, 25.00, 100.00, 75.00, 'cash', '2026-01-02 20:08:05', NULL, NULL, '2026-01-02 20:08:05', '2026-01-02 20:08:05');
INSERT INTO `payments` VALUES (2, 3, 15.00, 50.00, 35.00, 'cash', '2026-01-02 20:22:44', NULL, NULL, '2026-01-02 20:22:44', '2026-01-02 20:22:44');
INSERT INTO `payments` VALUES (3, 4, 15.00, 20.00, 5.00, 'cash', '2026-01-02 20:43:33', NULL, NULL, '2026-01-02 20:43:33', '2026-01-02 20:43:33');
INSERT INTO `payments` VALUES (4, 6, 15.00, 50.00, 35.00, 'cash', '2026-01-02 20:52:19', NULL, NULL, '2026-01-02 20:52:19', '2026-01-02 20:52:19');
INSERT INTO `payments` VALUES (5, 5, 15.00, 100.00, 85.00, 'cash', '2026-01-02 20:52:29', NULL, NULL, '2026-01-02 20:52:29', '2026-01-02 20:52:29');
INSERT INTO `payments` VALUES (6, 7, 15.00, 100.00, 85.00, 'cash', '2026-01-02 22:09:14', NULL, NULL, '2026-01-02 22:09:14', '2026-01-02 22:09:14');
INSERT INTO `payments` VALUES (7, 8, 15.00, 100.00, 85.00, 'cash', '2026-01-02 22:20:45', NULL, NULL, '2026-01-02 22:20:45', '2026-01-02 22:20:45');
INSERT INTO `payments` VALUES (8, 25, 6.00, 50.00, 44.00, 'cash', '2026-01-03 13:54:32', NULL, NULL, '2026-01-03 13:54:32', '2026-01-03 13:54:32');
INSERT INTO `payments` VALUES (9, 27, 10.00, 100.00, 90.00, 'cash', '2026-01-03 14:01:02', NULL, NULL, '2026-01-03 14:01:02', '2026-01-03 14:01:02');
INSERT INTO `payments` VALUES (10, 28, 20.00, 50.00, 30.00, 'cash', '2026-01-03 14:02:04', NULL, NULL, '2026-01-03 14:02:04', '2026-01-03 14:02:04');
INSERT INTO `payments` VALUES (11, 29, 10.00, 100.00, 90.00, 'cash', '2026-01-03 14:03:21', NULL, NULL, '2026-01-03 14:03:21', '2026-01-03 14:03:21');
INSERT INTO `payments` VALUES (12, 26, 6.00, 100.00, 94.00, 'cash', '2026-01-03 14:03:30', NULL, NULL, '2026-01-03 14:03:30', '2026-01-03 14:03:30');
INSERT INTO `payments` VALUES (13, 31, 20.00, 20.00, 0.00, 'cash', '2026-01-03 14:07:10', NULL, NULL, '2026-01-03 14:07:10', '2026-01-03 14:07:10');
INSERT INTO `payments` VALUES (14, 36, 60.00, 100.00, 40.00, 'cash', '2026-01-03 14:14:09', NULL, NULL, '2026-01-03 14:14:09', '2026-01-03 14:14:09');
INSERT INTO `payments` VALUES (15, 38, 10.00, 50.00, 40.00, 'cash', '2026-01-03 20:44:47', NULL, NULL, '2026-01-03 20:44:47', '2026-01-03 20:44:47');
INSERT INTO `payments` VALUES (16, 39, 20.00, 100.00, 80.00, 'cash', '2026-01-03 20:49:26', NULL, NULL, '2026-01-03 20:49:26', '2026-01-03 20:49:26');
INSERT INTO `payments` VALUES (17, 40, 6.00, 100.00, 94.00, 'cash', '2026-01-03 21:00:37', NULL, NULL, '2026-01-03 21:00:37', '2026-01-03 21:00:37');
INSERT INTO `payments` VALUES (18, 43, 45.00, 50.00, 5.00, 'cash', '2026-01-03 21:02:24', NULL, NULL, '2026-01-03 21:02:24', '2026-01-03 21:02:24');
INSERT INTO `payments` VALUES (19, 41, 6.00, 20.00, 14.00, 'cash', '2026-01-03 21:07:03', NULL, NULL, '2026-01-03 21:07:03', '2026-01-03 21:07:03');
INSERT INTO `payments` VALUES (20, 44, 20.00, 20.00, 0.00, 'cash', '2026-01-03 21:11:39', NULL, NULL, '2026-01-03 21:11:39', '2026-01-03 21:11:39');
INSERT INTO `payments` VALUES (21, 45, 6.00, 50.00, 44.00, 'cash', '2026-01-03 21:18:13', NULL, NULL, '2026-01-03 21:18:13', '2026-01-03 21:18:13');
INSERT INTO `payments` VALUES (22, 46, 10.00, 50.00, 40.00, 'cash', '2026-01-05 10:51:19', NULL, NULL, '2026-01-05 10:51:19', '2026-01-05 10:51:19');

-- ----------------------------
-- Table structure for personal_access_tokens
-- ----------------------------
DROP TABLE IF EXISTS `personal_access_tokens`;
CREATE TABLE `personal_access_tokens`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint UNSIGNED NOT NULL,
  `name` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `personal_access_tokens_token_unique`(`token` ASC) USING BTREE,
  INDEX `personal_access_tokens_tokenable_type_tokenable_id_index`(`tokenable_type` ASC, `tokenable_id` ASC) USING BTREE,
  INDEX `personal_access_tokens_expires_at_index`(`expires_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 64 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of personal_access_tokens
-- ----------------------------
INSERT INTO `personal_access_tokens` VALUES (1, 'App\\Models\\User', 1, 'auth-token', '6640d89541c453cb32608a67f45a91c8f48deb0ec04da74a5017b1b6385e8c1b', '[\"*\"]', '2026-01-02 20:12:06', NULL, '2026-01-02 20:05:27', '2026-01-02 20:12:06');
INSERT INTO `personal_access_tokens` VALUES (52, 'App\\Models\\User', 2, 'auth-token', 'a90f8ff86eee4c14f2f9c9a77d01132f4060e15f9837a600b16a27489462307f', '[\"*\"]', '2026-01-05 10:51:28', NULL, '2026-01-05 08:13:12', '2026-01-05 10:51:28');
INSERT INTO `personal_access_tokens` VALUES (55, 'App\\Models\\User', 1, 'auth-token', 'b150b5176127287b0b4a2098d7504caf7147f9929c5e2130973ede332b97d578', '[\"*\"]', '2026-01-07 13:59:33', NULL, '2026-01-07 13:08:18', '2026-01-07 13:59:33');
INSERT INTO `personal_access_tokens` VALUES (56, 'App\\Models\\User', 1, 'auth-token', '23808d589c4dec439ff1586165108598b419c5f83c1699495da1a6cb86937e6e', '[\"*\"]', NULL, NULL, '2026-01-09 23:11:44', '2026-01-09 23:11:44');
INSERT INTO `personal_access_tokens` VALUES (57, 'App\\Models\\User', 1, 'auth-token', '58caf85f59f5108c7ecbec76f6528178581604eec7132923e2e1ead472704eef', '[\"*\"]', NULL, NULL, '2026-01-09 23:18:11', '2026-01-09 23:18:11');
INSERT INTO `personal_access_tokens` VALUES (58, 'App\\Models\\User', 1, 'auth-token', 'ee1d8f412159801f494e5d0d11642eaf84a04a78522fe7806cc8717c6e34ea3f', '[\"*\"]', NULL, NULL, '2026-01-09 23:18:24', '2026-01-09 23:18:24');
INSERT INTO `personal_access_tokens` VALUES (63, 'App\\Models\\User', 1, 'auth-token', 'c64b572e6d03d4cb91fc3204ddf45f15930df20a196d68413f2e18a6be0613ef', '[\"*\"]', '2026-01-10 15:59:15', NULL, '2026-01-10 13:40:29', '2026-01-10 15:59:15');

-- ----------------------------
-- Table structure for pricing_modes
-- ----------------------------
DROP TABLE IF EXISTS `pricing_modes`;
CREATE TABLE `pricing_modes`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `label` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of pricing_modes
-- ----------------------------
INSERT INTO `pricing_modes` VALUES (1, '', '', '2026-01-02 19:58:13', '2026-01-02 19:58:13');

-- ----------------------------
-- Table structure for product_sales
-- ----------------------------
DROP TABLE IF EXISTS `product_sales`;
CREATE TABLE `product_sales`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` bigint UNSIGNED NOT NULL,
  `staff_id` bigint UNSIGNED NULL DEFAULT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(8, 2) NOT NULL,
  `total_price` decimal(8, 2) NOT NULL,
  `payment_method` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'cash',
  `sale_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `product_sales_product_id_foreign`(`product_id` ASC) USING BTREE,
  INDEX `product_sales_staff_id_foreign`(`staff_id` ASC) USING BTREE,
  CONSTRAINT `product_sales_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `product_sales_staff_id_foreign` FOREIGN KEY (`staff_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of product_sales
-- ----------------------------
INSERT INTO `product_sales` VALUES (1, 1, 2, 1, 3.00, 3.00, 'cash', '2026-01-04 13:23:37', '2026-01-04 13:23:37', '2026-01-04 13:23:37');
INSERT INTO `product_sales` VALUES (2, 2, 2, 1, 5.00, 5.00, 'cash', '2026-01-04 13:23:37', '2026-01-04 13:23:37', '2026-01-04 13:23:37');
INSERT INTO `product_sales` VALUES (3, 1, 2, 1, 3.00, 3.00, 'cash', '2026-01-04 13:38:48', '2026-01-04 13:38:48', '2026-01-04 13:38:48');
INSERT INTO `product_sales` VALUES (4, 2, 2, 1, 5.00, 5.00, 'cash', '2026-01-04 13:38:49', '2026-01-04 13:38:49', '2026-01-04 13:38:49');
INSERT INTO `product_sales` VALUES (5, 5, 2, 1, 5.00, 5.00, 'cash', '2026-01-04 13:38:50', '2026-01-04 13:38:50', '2026-01-04 13:38:50');
INSERT INTO `product_sales` VALUES (6, 8, 2, 1, 6.00, 6.00, 'cash', '2026-01-04 14:02:35', '2026-01-04 14:02:35', '2026-01-04 14:02:35');

-- ----------------------------
-- Table structure for products
-- ----------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(8, 2) NOT NULL,
  `size` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `stock` int NOT NULL DEFAULT 0,
  `is_available` tinyint(1) NOT NULL DEFAULT 1,
  `image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of products
-- ----------------------------
INSERT INTO `products` VALUES (1, 'Popcorn', 'snack', 3.00, 'petit', 98, 1, '🍿', '2026-01-03 22:20:04', '2026-01-04 13:38:48');
INSERT INTO `products` VALUES (2, 'Popcorn', 'snack', 5.00, 'grand', 78, 1, '🍿', '2026-01-03 22:20:04', '2026-01-04 13:38:49');
INSERT INTO `products` VALUES (3, 'Coca-Cola', 'drink', 5.00, 'petit', 50, 1, '🥤', '2026-01-03 22:20:04', '2026-01-03 22:20:04');
INSERT INTO `products` VALUES (4, 'Coca-Cola', 'drink', 7.00, 'grand', 50, 1, '🥤', '2026-01-03 22:20:04', '2026-01-03 22:20:04');
INSERT INTO `products` VALUES (5, 'Sprite', 'drink', 5.00, 'petit', 49, 1, '🥤', '2026-01-03 22:20:04', '2026-01-04 13:38:50');
INSERT INTO `products` VALUES (7, 'Eau minérale', 'drink', 3.00, NULL, 100, 1, '💧', '2026-01-03 22:20:04', '2026-01-03 22:20:04');
INSERT INTO `products` VALUES (8, 'Cafe', 'drink', 6.00, NULL, 0, 1, '☕', '2026-01-04 14:01:43', '2026-01-04 14:04:14');

-- ----------------------------
-- Table structure for sessions
-- ----------------------------
DROP TABLE IF EXISTS `sessions`;
CREATE TABLE `sessions`  (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint UNSIGNED NULL DEFAULT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `sessions_user_id_index`(`user_id` ASC) USING BTREE,
  INDEX `sessions_last_activity_index`(`last_activity` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sessions
-- ----------------------------
INSERT INTO `sessions` VALUES ('5XrxgVhuuYZsIM3rntTrbKVgEaj8SECFK6IWMJFp', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiT1VMc09nSEZaUWxRRnZmYmJ4UVRBbG83MlY5ZWhsTE5jWnlJbUprbiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1767791074);
INSERT INTO `sessions` VALUES ('FmdNRkQwq0NqQePwXTkDTVbONpMHbfRPxOL5wZ3b', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiaXhVM1VFVE8xdDZKTkpYVGlkYmt6NU94cVFEdFpjSmZ6SWNYYUVKOCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1767790531);
INSERT INTO `sessions` VALUES ('n1k2mK48TdCFliKgJzlwbCS7zPXsS1ZLDn8UyK3j', NULL, '127.0.0.1', 'PostmanRuntime/7.51.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiVGJnWjV2bDJtUDlYYm9BR3B2UDQyOVhmZUd2STJwbWpLTDFvTVR4UCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1767624176);
INSERT INTO `sessions` VALUES ('Qeh7QBun3zmA6hpqfkFIhIn1IUcqWawePJVFzRIF', NULL, '127.0.0.1', 'PostmanRuntime/7.51.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiRTZzNFJZdndLMlhFbEYwRlduTUZMTUdWWElsUGxyMnlod0d6QzlZRSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1767622358);
INSERT INTO `sessions` VALUES ('ZDxe92wm2YtSzz5b41dgMPMwSSwlLtO8cmCMkb6z', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiSk91djZDYUNwUDdGaDNQc2pQRG12T3JHRGVFeTVmcW95YjB0Znh4TiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1767622333);

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','agent') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'agent',
  `remember_token` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `users_email_unique`(`email` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'Admin ZSTATION', 'admin@zstation.ma', '$2y$12$DLYYgoiuGQC3kMyCl2VaIOrOR/rI.YDQeSDcrmSaFd9dKlQnf4Qi2', 'admin', NULL, '2026-01-02 19:54:55', '2026-01-02 19:54:55');
INSERT INTO `users` VALUES (2, 'Agent 1', 'agent@zstation.ma', '$2y$12$Rg1VraiLPKvFgq2Bu4T/p.nVpPgdGZITApLySGYMTWEs87zu4Mem.', 'agent', NULL, '2026-01-02 19:54:55', '2026-01-02 19:54:55');
INSERT INTO `users` VALUES (3, 'Admin', 'admin@zstation.com', '$2y$12$t0DKftV6Bt/LIK1ppKfRwOo6hLwLwffxpeQU5j11s.Zz1g0QCOG7O', 'admin', NULL, '2026-01-10 15:50:49', '2026-01-10 15:50:49');
INSERT INTO `users` VALUES (4, 'Agent', 'agent@zstation.com', '$2y$12$UwVNIkIA9gJhmTAMEA92wOIgqS.8oysobgdQYTUS6m.TuyMXH5hLy', 'agent', NULL, '2026-01-10 15:50:49', '2026-01-10 15:50:49');

SET FOREIGN_KEY_CHECKS = 1;
