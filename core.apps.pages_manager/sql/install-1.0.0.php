<?php
$db = mysql::get_instance();
$db->query("CREATE TABLE `pages` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `version_id` int(10) unsigned NOT NULL,
  `type` varchar(20) NOT NULL,
  `last_modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `data_js` text NOT NULL,
  `apps` text NOT NULL,
  `submenus` text NOT NULL,
  `url` varchar(255) NOT NULL,
  `name` varchar(128) NOT NULL,
  `title` varchar(255) NOT NULL DEFAULT 'Page title',
  `description` longtext NOT NULL,
  `access_mode` varchar(15) DEFAULT NULL,
  `pwd` varchar(32) NOT NULL,
  `published` tinyint(1) NOT NULL DEFAULT '1',
  `show_on_sitemap` tinyint(1) NOT NULL DEFAULT '1',
  `text_index` text,
  `text_index_ready` tinyint(4) NOT NULL DEFAULT '0',
  `meta_code` text,
  `ads_visible` tinyint(4) DEFAULT '0',
  `ads_code` text NOT NULL,
  `header_doc_id` int(10) unsigned DEFAULT NULL,
  `body_doc_id` int(10) unsigned NOT NULL,
  `footer_code` varchar(255) NOT NULL,
  `images_html` text NOT NULL,
  `style` varchar(24) NOT NULL,
  `mobile_style_id` int(10) unsigned NOT NULL DEFAULT '0',
  `pc_style_id` int(10) unsigned NOT NULL DEFAULT '0',
  `ecom_category_id` int(11) NOT NULL,
  `rss_title` varchar(255) NOT NULL,
  `is_rss_available` tinyint(4) NOT NULL DEFAULT '0',
  `has_comments` tinyint(4) DEFAULT '0',
  `header_row_visible` tinyint(4) NOT NULL DEFAULT '1',
  `footer_row_visible` tinyint(4) NOT NULL DEFAULT '1',
  `header_visible` tinyint(4) DEFAULT '2',
  `footer_visible` tinyint(4) NOT NULL DEFAULT '2',
  `analytics_code` text NOT NULL,
  `use_home_analytics_code` tinyint(4) NOT NULL DEFAULT '0',
  `is_page_tpl` tinyint(4) NOT NULL DEFAULT '0',
  `thumb` varchar(128) NOT NULL,
  `apps_locked` tinyint(3) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `url` (`url`) USING BTREE,
  KEY `site_id_version_id` (`version_id`) USING BTREE,
  FULLTEXT KEY `idx` (`text_index`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;");

//create page
$db->query("INSERT INTO `pages` (`id`, `version_id`, `type`, `last_modified`, `data_js`, `apps`, `submenus`, `url`, `name`, `title`, `description`, `access_mode`, `pwd`, `published`, `show_on_sitemap`, `text_index`, `text_index_ready`, `meta_code`, `ads_visible`, `ads_code`, `header_doc_id`, `body_doc_id`, `footer_code`, `images_html`, `style`, `mobile_style_id`, `pc_style_id`, `ecom_category_id`, `rss_title`, `is_rss_available`, `has_comments`, `header_row_visible`, `footer_row_visible`, `header_visible`, `footer_visible`, `analytics_code`, `use_home_analytics_code`, `is_page_tpl`, `thumb`, `apps_locked`)
VALUES
	(1, 1, 'std', NOW(), '', '', '', 'index', 'Page', 'Page', '', '', '', 1, 1, NULL, 0, '', 0, '', NULL, 0, '', '', '', 0, 0, 0, '', 0, 0, 1, 1, 0, 0, '', 1, 0, '', 0);
");

//create rows and layouts

$db->query("CREATE TABLE `layout_rows` (
`id`                        int(10) unsigned        NOT NULL AUTO_INCREMENT,
`version_id`                int(10) unsigned        NOT NULL,
`pc_data`                   text
CHARACTER SET utf8
COLLATE utf8_unicode_ci NOT NULL,
`pc_style_id`               int(10) unsigned        NOT NULL DEFAULT '0',
`pc_used_apps`              text
CHARACTER SET utf8
COLLATE utf8_unicode_ci NOT NULL,
`pc_used_texts`             text
CHARACTER SET utf8
COLLATE utf8_unicode_ci NOT NULL,
`pc_used_submenus`          text
CHARACTER SET utf8
COLLATE utf8_unicode_ci NOT NULL,
`pc_used_images`            text
CHARACTER SET utf8
COLLATE utf8_unicode_ci NOT NULL,
`pc_used_styles`            text
CHARACTER SET utf8
COLLATE utf8_unicode_ci NOT NULL,
`pc_search_index_ready`     tinyint(4)              NOT NULL,
`pc_search_index`           text
CHARACTER SET utf8
COLLATE utf8_unicode_ci NOT NULL,
`mobile_data`               text
CHARACTER SET utf8
COLLATE utf8_unicode_ci NOT NULL,
`mobile_style_id`           int(10) unsigned        NOT NULL DEFAULT '0',
`mobile_used_apps`          text
CHARACTER SET utf8
COLLATE utf8_unicode_ci NOT NULL,
`mobile_used_texts`         text
CHARACTER SET utf8
COLLATE utf8_unicode_ci NOT NULL,
`mobile_used_submenus`      text
CHARACTER SET utf8
COLLATE utf8_unicode_ci NOT NULL,
`mobile_used_images`        text
CHARACTER SET utf8
COLLATE utf8_unicode_ci NOT NULL,
`mobile_used_styles`        text
CHARACTER SET utf8
COLLATE utf8_unicode_ci NOT NULL,
`mobile_search_index_ready` tinyint(4)              NOT NULL,
`mobile_search_index`       text
CHARACTER SET utf8
COLLATE utf8_unicode_ci NOT NULL,
PRIMARY KEY (`id`),
KEY `site_id_version_id` (`version_id`),
FULLTEXT KEY `search_index` (`pc_search_index`),
FULLTEXT KEY `mobile_search_index` (`mobile_search_index`)
)
ENGINE = MyISAM
DEFAULT CHARSET = latin1;");

$db->query("CREATE TABLE `layout_rows2pages` (
`version_id` int(10) unsigned    NOT NULL,
`page_id`    int(10) unsigned    NOT NULL,
`row_id`     int(10) unsigned    NOT NULL,
`position`   tinyint(3) unsigned NOT NULL,
`owner`      tinyint(4)          NOT NULL DEFAULT '1',
KEY `site_id` (`page_id`),
KEY `site_id_version_id` (`version_id`)
)
ENGINE = MyISAM
DEFAULT CHARSET = latin1;");

$db->query("CREATE TABLE `layout_rows2texts` (
`version_id`  int(10) unsigned        NOT NULL,
`row_id`      int(10) unsigned        NOT NULL,
`text_id`     int(10) unsigned        NOT NULL,
`layout_mode` enum('pc', 'mobile')
COLLATE utf8_unicode_ci NOT NULL,
KEY `site_id_row_id` (`row_id`),
KEY `site_id_version_id` (`version_id`)
)
ENGINE = MyISAM
DEFAULT CHARSET = utf8
COLLATE = utf8_unicode_ci;");

$db->query("INSERT INTO `layout_rows` (`id`, `version_id`, `pc_data`, `pc_style_id`, `pc_used_apps`, `pc_used_texts`, `pc_used_submenus`, `pc_used_images`, `pc_used_styles`, `pc_search_index_ready`, `pc_search_index`, `mobile_data`, `mobile_style_id`, `mobile_used_apps`, `mobile_used_texts`, `mobile_used_submenus`, `mobile_used_images`, `mobile_used_styles`, `mobile_search_index_ready`, `mobile_search_index`)
VALUES
(1,1,'{\"layout\":[{\"type\":\"container\",\"childs\":[{\"type\":\"cell\",\"width\":100,\"childs\":[]}]}],\"profiles\":{},\"style\":\"\",\"title\":\"\"}',0,'','','','','',0,'','',0,'','','','','',0,''),
	(2,1,'{\"layout\":[{\"type\":\"container\",\"childs\":[{\"type\":\"cell\",\"width\":100,\"childs\":[]}]}],\"profiles\":{},\"style\":\"\",\"title\":\"\"}',0,'','','','','',0,'','',0,'','','','','',0,''),
	(3,1,'{\"layout\":[{\"type\":\"container\",\"childs\":[{\"type\":\"cell\",\"width\":100,\"childs\":[]}]}],\"profiles\":{},\"style\":\"\",\"title\":\"\"}',0,'','','','','',0,'','',0,'','','','','',0,''),
	(4,1,'{\"layout\":[{\"type\":\"container\",\"childs\":[{\"type\":\"cell\",\"width\":100,\"childs\":[]}]}],\"profiles\":{},\"style\":\"\",\"title\":\"\"}',0,'','','','','',0,'','',0,'','','','','',0,''),
	(5,1,'{\"layout\":[{\"type\":\"container\",\"childs\":[{\"type\":\"cell\",\"width\":100,\"childs\":[]}]}],\"profiles\":{},\"style\":\"\",\"title\":\"\"}',0,'','','','','',0,'','',0,'','','','','',0,''),
	(6,1,'{\"layout\":[{\"type\":\"container\",\"childs\":[{\"type\":\"cell\",\"width\":100,\"childs\":[]}]}],\"profiles\":{},\"style\":\"\",\"title\":\"\"}',0,'','','','','',0,'','',0,'','','','','',0,'');

");

$db->query("INSERT INTO `layout_rows2pages` (`version_id`, `page_id`, `row_id`, `position`, `owner`)
VALUES
(1,0,1,0,1),
	(1,0,2,1,1),
	(1,0,3,255,1),
	(1,1,4,1,1),
	(1,1,5,0,1),
	(1,1,6,255,1);");





