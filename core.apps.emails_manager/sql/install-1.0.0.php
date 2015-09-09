<?php
$db = mysql::get_instance();

$db->query("
CREATE TABLE `email_infos` (
`id`  int(10) UNSIGNED NOT NULL AUTO_INCREMENT ,
`key`  varchar(32) CHARACTER SET cp1251 COLLATE cp1251_general_ci NOT NULL ,
`name`  varchar(255) CHARACTER SET cp1251 COLLATE cp1251_general_ci NOT NULL ,
`description`  text CHARACTER SET cp1251 COLLATE cp1251_general_ci NOT NULL ,
`placeholders`  text CHARACTER SET cp1251 COLLATE cp1251_general_ci NULL ,
PRIMARY KEY (`id`),
INDEX `KEY` (`key`) USING BTREE
)
ENGINE=MyISAM
DEFAULT CHARACTER SET=cp1251 COLLATE=cp1251_general_ci;
");

$db->query("
CREATE TABLE `email_templates` (
`id`  int(10) UNSIGNED NOT NULL AUTO_INCREMENT ,
`email_info_id`  int(10) UNSIGNED NOT NULL ,
`subject`  varchar(255) CHARACTER SET cp1251 COLLATE cp1251_general_ci NOT NULL ,
`body`  text CHARACTER SET cp1251 COLLATE cp1251_general_ci NOT NULL ,
PRIMARY KEY (`id`)
)
ENGINE=MyISAM
DEFAULT CHARACTER SET=cp1251 COLLATE=cp1251_general_ci
;");