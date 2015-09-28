<?php
$db =& mysql::get_instance();
$db->query('DROP TABLE themes_categories');
$db->query('DROP TABLE themes2css_styles');


