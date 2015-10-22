<?php
$db = mysql::get_instance();
$db->query("DROP TABLE IF EXISTS `forms`");
$db->query("CREATE TABLE `forms` (
  `id`               int(10) unsigned NOT NULL AUTO_INCREMENT,
  `title`            varchar(255)     NOT NULL,
  `description`      text             NOT NULL,
  `confirmation`     text             NOT NULL,
  `fields`           text,
  `list_field_name`  varchar(255)     NOT NULL,
  `list_field_label` varchar(255)     NOT NULL,
  PRIMARY KEY (`id`)
)
  ENGINE = MyISAM
  DEFAULT CHARSET = latin1;");

$db->query("DROP TABLE IF EXISTS `forms_data`;");
$db->query("CREATE TABLE `forms_data` (
  `id`               bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `date`             datetime            NOT NULL,
  `form_id`          bigint(20) unsigned NOT NULL,
  `email`            varchar(255)        NOT NULL,
  `data`             text                NOT NULL,
  `list_field_value` char(255)                    DEFAULT NULL,
  `list_field_name`  char(255)                    DEFAULT NULL,
  PRIMARY KEY (`id`)
)
  ENGINE = MyISAM
  DEFAULT CHARSET = latin1;");

$db->query("DROP TABLE IF EXISTS `forms_files`;");
$db->query("CREATE TABLE `forms_files` (
  `id`            bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id`       bigint(20) unsigned NOT NULL,
  `form_id`       bigint(20) unsigned NOT NULL,
  `forms_data_id` bigint(20) unsigned NOT NULL,
  `name`          varchar(255)        NOT NULL,
  `sys_name`      varchar(255)        NOT NULL,
  PRIMARY KEY (`id`)
)
  ENGINE = MyISAM
  DEFAULT CHARSET = latin1;
");










