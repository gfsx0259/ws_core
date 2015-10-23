<?php
$db = mysql::get_instance();
$db->query("ALTER TABLE `sites` ADD COLUMN `custom_vendors` text NULL;");
