<?php
$db =& mysql::get_instance();
$db->query('ALTER TABLE `sites` DROP COLUMN `custom_vendors`;');

