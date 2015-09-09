<?php

class dialog_controller_help_center extends dialog_controller
{

    public $appAPIs = [
        "help_center"
    ];

    function run()
    {
        parent::run();
        if ($this->usertype < USERTYPE_ADMIN) return array("status" => "error");
        switch ($_REQUEST["act"]) {

            case "set_status":
                $status = (int)$_REQUEST["status"];
                $this->help_center->setShowHelp($status);
                return array("status" => "updated");
                break;

            case "get_file":
                $f = "help/" . str_replace("..", "", $_REQUEST["name"]);
                if (!file_exists($f)) {
                    $f = "help/404.html";
                }
                $res = array(
                    "status" => "file",
                    "content" => file_get_contents($f)
                );

                if ($_REQUEST["load_menu"] == 1) {
                    $res["menu_content"] = file_get_contents("help/menu.html");
                }
                return $res;
                break;

        }
    }
}
