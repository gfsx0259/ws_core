<?php
$db =& mysql::get_instance();
$db->query('
    CREATE TABLE `menus` (
    `version_id`  int(10) UNSIGNED NOT NULL ,
    `data_js`  text CHARACTER SET cp1251 COLLATE cp1251_general_ci NULL ,
    `data_php`  text CHARACTER SET cp1251 COLLATE cp1251_general_ci NOT NULL ,
    `flags`  varchar(32) CHARACTER SET cp1251 COLLATE cp1251_general_ci NOT NULL ,
    PRIMARY KEY (`version_id`)
    )
    ENGINE=MyISAM
    DEFAULT CHARSET=latin1;
');

