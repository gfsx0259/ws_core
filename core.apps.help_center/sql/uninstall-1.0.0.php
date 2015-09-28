<?php
$db = mysql::get_instance();


$db->query('ALTER TABLE `sites` DROP COLUMN `show_help`;');