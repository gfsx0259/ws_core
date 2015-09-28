<?php
$db =& mysql::get_instance();
$db->query('DROP TABLE themes');
$db->query('DROP TABLE themes2');


