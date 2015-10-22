<?php
$db =& mysql::get_instance();
$db->query('DROP TABLE IF EXISTS `forms`');
$db->query("DROP TABLE IF EXISTS `forms_data`");
$db->query("DROP TABLE IF EXISTS `forms_files`");

