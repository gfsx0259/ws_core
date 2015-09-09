<?php
$db = mysql::get_instance();
$db->query("
CREATE TABLE `themes` (
`id`  int(11) NOT NULL AUTO_INCREMENT ,
`category`  int(11) NOT NULL DEFAULT 1 ,
`name`  varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL ,
`title`  varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL ,
PRIMARY KEY (`id`)
)
ENGINE=MyISAM
DEFAULT CHARACTER SET=latin1 COLLATE=latin1_swedish_ci;
");

$db->query("CREATE TABLE `themes2` (
`id`  int(10) UNSIGNED NOT NULL AUTO_INCREMENT ,
`user_id`  int(10) UNSIGNED NOT NULL ,
`title`  varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL ,
`colors`  text CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL ,
`fonts`  text CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL ,
`thumb`  varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL ,
PRIMARY KEY (`id`),
INDEX `user_id` (`user_id`) USING BTREE
)
ENGINE=MyISAM
DEFAULT CHARACTER SET=latin1 COLLATE=latin1_swedish_ci
;");