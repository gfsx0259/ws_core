<?php
$db = mysql::get_instance();
$db->query("
    CREATE TABLE `texts` (
    `id`  int(10) UNSIGNED NOT NULL AUTO_INCREMENT ,
    `title`  varchar(120) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL DEFAULT '' ,
    `content`  text CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL ,
    `tags`  varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NULL DEFAULT NULL ,
    `size`  mediumint(9) NULL DEFAULT 0 ,
    `created`  int(10) UNSIGNED NOT NULL ,
    `modified`  int(10) UNSIGNED NOT NULL ,
    `content_index`  longtext CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL ,
    `summary`  text CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL ,
    `author`  varchar(255) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL ,
    PRIMARY KEY (`id`),
    FULLTEXT INDEX `tags` (`tags`)
    )
    ENGINE=MyISAM
    DEFAULT CHARACTER SET=latin1 COLLATE=latin1_swedish_ci;
");