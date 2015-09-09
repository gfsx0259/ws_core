<?php
$db = mysql::get_instance();
$db->query('ALTER TABLE `sites` ADD COLUMN `show_help`  tinyint(1) NOT NULL DEFAULT 1;');