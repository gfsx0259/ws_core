<?php
$db =& mysql::get_instance();
$db->query(
    'CREATE TABLE IF NOT EXISTS `baloon_tooltips` (
  `id` mediumint(8) unsigned NOT NULL,
  `title` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `description` text COLLATE utf8_unicode_ci NOT NULL
) ENGINE=MyISAM AUTO_INCREMENT=15 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;'
);

$db->query(
    "INSERT INTO `baloon_tooltips` (`id`, `title`, `description`) VALUES
(1, 'Copy element', 'Copies the element to the clipboard so you can paste it to any page.'),
(2, 'Site Managers', 'Contains all site management options to manage your site''s functionality.'),
(3, 'Publish your changes', 'Click this button to publish your changes so visitors to your site will see your changes.'),
(4, 'Paste copied element', 'Drag this button to the page to paste the element you have previously copied as many times as you wish. '),
(5, 'Undo changes', 'You can undo changes made to the page layout by clicking this button.'),
(6, 'Redo changes', 'You can redo any changes that you have previously undone.'),
(7, 'Upload from your computer', 'Click this to upload files from your computer to this website.'),
(8, 'Upload from the internet', 'Click this button to upload a file from the internet to this website. You need to supply the correct url to the file.'),
(9, 'Preview the page', 'Click this button to preview the page in a new tab to see how it will look to your visitors.'),
(10, 'Get Help', 'Click this button to open the help center to view information about how to use this site.'),
(11, 'PC page view', 'PC page editor targets screen resolutions 1024 pixels wide and above.  Visitors don''t have to be using a PC to see your pages.  The PC page view is the default layout and if a mobile layout isnt specified this layout will be displayed.'),
(12, 'Mobile page view', 'Select the mobile page view to edit how your site will display on screens with a resolution smaller than 1024 pixels wide.'),
(13, 'Hide elements menu', 'Click to hide the elements menu.'),
(14, 'Exit site editor', 'Exit the site editor and return to the admin section');"
);
$db->query(
    'ALTER TABLE `baloon_tooltips` ADD PRIMARY KEY (`id`);'
);

$db->query(
    "ALTER TABLE `baloon_tooltips` MODIFY `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=15;"
);