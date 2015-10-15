<?php


class dialog_controller_bootstrap_manager_init extends dialog_site
{
    function __construct(&$dialog){
        $dialog->useAppAPI("bootstrap_manager/bootstrap");
        $dialog->bootstrap_css = $dialog->bootstrap->getCurrentBSTheme();
    }
}