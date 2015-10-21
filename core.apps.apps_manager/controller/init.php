<?php


class dialog_controller_apps_manager_init extends dialog_site
{
    function __construct(&$dialog){
        $dialog->useAppAPI("apps_manager/apps");
    }
}