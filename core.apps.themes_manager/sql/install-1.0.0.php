<?php
$db = mysql::get_instance();
$db->query("
CREATE TABLE `themes_categories` (
`id`  int(11) NOT NULL AUTO_INCREMENT ,
`type`  enum('premium','basic','custom') CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL ,
`title`  varchar(128) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL ,
PRIMARY KEY (`id`)
)
ENGINE=MyISAM
DEFAULT CHARACTER SET=latin1 COLLATE=latin1_swedish_ci;
");

$db->query("
CREATE TABLE `themes2css_styles` (
`theme_id`  int(10) UNSIGNED NOT NULL ,
`css_style_id`  int(10) UNSIGNED NOT NULL ,
`is_default`  tinyint(4) NOT NULL DEFAULT 0 ,
INDEX `theme_id` (`theme_id`) USING BTREE
)
ENGINE=MyISAM
DEFAULT CHARACTER SET=utf8 COLLATE=utf8_unicode_ci
;");