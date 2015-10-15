<?php

class dialog_controller_bootstrap_manager extends dialog_controller
{

    public $widgetName = 'bootstrap_manager';
    public $appAPIs = [
        'bootstrap'
    ];


    function run()
    {
        parent::run();

        if ($this->usertype < USERTYPE_ADMIN) {
            return array("status" => "error");
        }

        switch ($_GET["act"]) {
            case "get_list":
                $res = array(
                    "status" => "ok",
                    "files_list" => $this->bootstrap->get_list()
                );
                return $res;
                break;

            case 'save':
                $data = json_decode($_REQUEST['data']);
                $this->bootstrap->save($data);
                return array(
                    "status" => "ok"
                );
                break;
        }

        return array("status" => "error");
    }




}