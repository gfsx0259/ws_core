<?php
$db = mysql::get_instance();
$db->query("CREATE TABLE `bs_themes` (
`theme_id`  int NOT NULL AUTO_INCREMENT ,
`path`  varchar(255) NOT NULL ,
`is_default`  tinyint(1) NULL DEFAULT 0 ,
PRIMARY KEY (`theme_id`)
);
");

