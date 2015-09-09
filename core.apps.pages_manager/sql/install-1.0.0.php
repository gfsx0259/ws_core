<?php
$db = mysql::get_instance();
$db->query("CREATE TABLE `pages` (
`id`  int(10) UNSIGNED NOT NULL AUTO_INCREMENT ,
`version_id`  int(10) UNSIGNED NOT NULL ,
`type`  varchar(20) CHARACTER SET cp1251 COLLATE cp1251_general_ci NOT NULL ,
`last_modified`  timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP ,
`data_js`  text CHARACTER SET cp1251 COLLATE cp1251_general_ci NOT NULL ,
`apps`  text CHARACTER SET cp1251 COLLATE cp1251_general_ci NOT NULL ,
`submenus`  text CHARACTER SET cp1251 COLLATE cp1251_general_ci NOT NULL ,
`url`  varchar(255) CHARACTER SET cp1251 COLLATE cp1251_general_ci NOT NULL ,
`name`  varchar(128) CHARACTER SET cp1251 COLLATE cp1251_general_ci NOT NULL ,
`title`  varchar(255) CHARACTER SET cp1251 COLLATE cp1251_general_ci NOT NULL DEFAULT 'Page title' ,
`description`  longtext CHARACTER SET cp1251 COLLATE cp1251_general_ci NOT NULL ,
`access_mode`  varchar(15) CHARACTER SET cp1251 COLLATE cp1251_general_ci NULL DEFAULT NULL ,
`pwd`  varchar(32) CHARACTER SET cp1251 COLLATE cp1251_general_ci NOT NULL ,
`published`  tinyint(1) NOT NULL DEFAULT 1 ,
`show_on_sitemap`  tinyint(1) NOT NULL DEFAULT 1 ,
`text_index`  text CHARACTER SET cp1251 COLLATE cp1251_general_ci NULL ,
`text_index_ready`  tinyint(4) NOT NULL DEFAULT 0 ,
`meta_code`  text CHARACTER SET cp1251 COLLATE cp1251_general_ci NULL ,
`ads_visible`  tinyint(4) NULL DEFAULT 0 ,
`ads_code`  text CHARACTER SET cp1251 COLLATE cp1251_general_ci NOT NULL ,
`header_doc_id`  int(10) UNSIGNED NULL DEFAULT NULL ,
`body_doc_id`  int(10) UNSIGNED NOT NULL ,
`footer_code`  varchar(255) CHARACTER SET cp1251 COLLATE cp1251_general_ci NOT NULL ,
`images_html`  text CHARACTER SET cp1251 COLLATE cp1251_general_ci NOT NULL ,
`style`  varchar(24) CHARACTER SET cp1251 COLLATE cp1251_general_ci NOT NULL ,
`mobile_style_id`  int(10) UNSIGNED NOT NULL DEFAULT 0 ,
`pc_style_id`  int(10) UNSIGNED NOT NULL DEFAULT 0 ,
`ecom_category_id`  int(11) NOT NULL ,
`rss_title`  varchar(255) CHARACTER SET cp1251 COLLATE cp1251_general_ci NOT NULL ,
`is_rss_available`  tinyint(4) NOT NULL DEFAULT 0 ,
`has_comments`  tinyint(4) NULL DEFAULT 0 ,
`header_row_visible`  tinyint(4) NOT NULL DEFAULT 1 ,
`footer_row_visible`  tinyint(4) NOT NULL DEFAULT 1 ,
`header_visible`  tinyint(4) NULL DEFAULT 2 ,
`footer_visible`  tinyint(4) NOT NULL DEFAULT 2 ,
`analytics_code`  text CHARACTER SET cp1251 COLLATE cp1251_general_ci NOT NULL ,
`use_home_analytics_code`  tinyint(4) NOT NULL DEFAULT 0 ,
`is_page_tpl`  tinyint(4) NOT NULL DEFAULT 0 ,
`thumb`  varchar(128) CHARACTER SET cp1251 COLLATE cp1251_general_ci NOT NULL ,
`apps_locked`  tinyint(3) UNSIGNED NOT NULL DEFAULT 0 ,
PRIMARY KEY (`id`),
INDEX `url` (`url`) USING BTREE ,
INDEX `site_id_version_id` (`version_id`) USING BTREE ,
FULLTEXT INDEX `idx` (`text_index`)
)
ENGINE=MyISAM
DEFAULT CHARACTER SET=cp1251 COLLATE=cp1251_general_ci;");



