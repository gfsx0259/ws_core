<?php
$db = mysql::get_instance();
$db->query("
CREATE TABLE `site_styles` (
`version_id`  int(10) UNSIGNED NOT NULL ,
`last_change`  int(10) UNSIGNED NOT NULL DEFAULT 0 ,
`pc_default_styles`  text CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL ,
`mobile_default_styles`  text CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL ,
PRIMARY KEY (`version_id`)
)
ENGINE=MyISAM
DEFAULT CHARACTER SET=latin1 COLLATE=latin1_swedish_ci
;");