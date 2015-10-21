<?php

class dialog_controller_apps_manager extends dialog_controller
{

    public $widgetName = 'apps_manager';
    public $appAPIs = [
        'apps'
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
                    "data" => $this->apps->getData()
                );
                return $res;
                $res = array(
                    "status" => "ok",
                    "files_list" => $this->apps->getInstalledAppsData()
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