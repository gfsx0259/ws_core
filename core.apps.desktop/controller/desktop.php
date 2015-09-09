<?php

class dialog_controller_desktop extends dialog_controller
{

    public $appAPIs = [
        'desktop/session_data'
    ];

    function run()
    {
        parent::run();
        if ($this->usertype < USERTYPE_ADMIN) return array("status" => "error");
        switch ($_REQUEST["act"]) {
            case "set":
                $this->session_data->set($_REQUEST["key"], $_REQUEST["data"]);
                break;
        }
        return array("status" => "ok");
    }
}

