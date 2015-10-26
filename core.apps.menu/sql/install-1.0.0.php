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


$db->query("INSERT INTO `menus` (`version_id`, `data_js`, `data_php`, `flags`)
VALUES
(1,'[{\"title\":\"Home\",\"hint\":\"\",\"url\":\"index\",\"blank_page\":0,\"published\":1,\"visible\":\"1\",\"footer_link\":\"\",\"type\":\"std\",\"childs\":[],\"id\":2,\"body_menu\":null,\"access_mode\":\"\"}]','a:1:{i:0;a:12:{s:5:\"title\";s:4:\"Home\";s:4:\"hint\";s:0:\"\";s:3:\"url\";s:5:\"index\";s:10:\"blank_page\";i:0;s:9:\"published\";i:1;s:7:\"visible\";s:1:\"1\";s:11:\"footer_link\";s:0:\"\";s:4:\"type\";s:3:\"std\";s:6:\"childs\";a:0:{}s:2:\"id\";i:2;s:9:\"body_menu\";N;s:11:\"access_mode\";s:0:\"\";}}','');
");

echo "\n" . 'MENU ITEM added' . "\n";