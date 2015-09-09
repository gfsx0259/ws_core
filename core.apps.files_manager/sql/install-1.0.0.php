<?php
$db = mysql::get_instance();
$db->query("
CREATE TABLE `filesmanager_search` (
    `folder`  varchar(10) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL DEFAULT '' ,
    `data`  text CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL ,
    PRIMARY KEY (`folder`)
    )
    ENGINE=MyISAM
    DEFAULT CHARACTER SET=latin1 COLLATE=latin1_swedish_ci;
");
