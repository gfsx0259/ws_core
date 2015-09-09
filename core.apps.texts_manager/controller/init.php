<?php


class dialog_controller_texts_manager_init extends dialog_site
{
    function __construct(&$dialog){
        $dialog->useAppAPI("texts_manager/site_texts");
    }
}