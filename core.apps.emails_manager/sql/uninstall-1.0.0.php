<?php
$db =& mysql::get_instance();
$db->query('DROP TABLE email_infos');
$db->query('DROP TABLE email_templates');


