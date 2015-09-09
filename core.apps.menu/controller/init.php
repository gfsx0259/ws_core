<?php

class dialog_controller_menu_init extends dialog_site
{

    function __construct(&$dialog)
    {
        $this->useAppAPI("menu/site_menu");
        $this->initSiteMenu($dialog);
    }

    // std page
    function initSiteMenu(&$dialog)
    {
        $p = array(
            "version_id" => $dialog->site_version["id"]
        );

        $dialog->main_menu = $this->site_menu->get($p, $dialog->page_file);
    }
}