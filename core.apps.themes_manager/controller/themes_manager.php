<?php

class dialog_controller_themes_manager extends dialog_controller
{

    public $appAPIs = [
        'themes/themes2'
    ];


    function run()
    {
        parent::run();

        if ($this->usertype < USERTYPE_ADMIN) {
            return array("status" => "error");
        }

        global $config;


        switch ($_GET["act"]) {
            case "get_list":
                $res = array(
                    "status" => "ok",
                    "themes_list" => $this->themes2->getList()
                );
                return $res;
                break;


            case "delete":
                $p = array(
                    "id" => $_GET["id"]
                );
                $this->themes2->delete($p);
                return array(
                    "status" => "ok",
                    "themes_list" => $this->themes2->getList()
                );
                break;


            case "use_theme":
                $theme_id = $_GET["id"];
                $theme = $this->themes2->get($theme_id);
                if (!$theme) {
                    return array(
                        "status" => "error"
                    );
                }
                $p = array(
                    "id" => $theme_id,
                    "version_id" => $this->site_version["id"],
                    "layout_mode" => $this->layout_mode
                );
                $this->themes2->applyToSite($p);
                return array(
                    "status" => "ok",
                    "theme" => $theme
                );
                break;


            case "create":
                $p = array(
                    "title" => stripslashes($_REQUEST["title"]),
                    "thumb" => str_replace("..", "", $_REQUEST["thumb"]),
                    "colors" => stripslashes($_REQUEST["colors"]),
                    "fonts" => stripslashes($_REQUEST["fonts"]),
                    "styles" => $this->json->decode($_REQUEST["styles"])
                );
                $dir = $this->getSiteFilesDir();
                if ($this->themes2->create($p, $dir)) {
                    return array(
                        "status" => "ok",
                        "themes_list" => $this->themes2->getList()
                    );
                } else {
                    return array("status" => "error");
                }
                break;


            case "update":
                $p = array(
                    "title" => stripslashes($_REQUEST["title"]),
                    "thumb" => str_replace("..", "", $_REQUEST["thumb"]),
                    "id" => $_REQUEST["id"],
                    "styles" => $this->json->decode($_REQUEST["styles"]),
                    "colors" => stripslashes($_REQUEST["colors"]),
                    "fonts" => stripslashes($_REQUEST["fonts"])
                );
                $dir = $this->getSiteFilesDir();
                $this->themes2->update($p, $dir);

                $res = array(
                    "status" => "ok",
                    "themes_list" => $this->themes2->getList()
                );

                if ($_REQUEST["load_default_styles"] == 1) {
                    $res["theme_default_styles"] = $this->themes2->getDefaultStyles($p["id"]);
                }

                return $res;
                break;


            case "save_to_file":
                $p = array(
                    "id" => $_REQUEST["id"]
                );
                $dir = $this->getSiteFilesDir();
                $this->themes2->saveToFile($p, $dir);
                return array(
                    "status" => "ok"
                );
                break;


            case "load_from_file":
                $p = array(
                    "file" => $this->getSiteFilesDir() . str_replace("..", "", $_REQUEST["file"]),
                    "new_title" => $_REQUEST["new_title"]
                );

//                    $file = $this->getSiteFilesDir().$_REQUEST["file"];
//                    $this->themes2->loadFromFile($this->site_owner["id"], $file);
                $this->themes2->loadFromFile($p);
                return array(
                    "status" => "ok",
                    "themes_list" => $this->themes2->getList()
                );
                break;

        }
        return array("status" => "error");
    }


    function getSiteFilesDir()
    {
        global $config;
        return $config["storage"] . "/";
    }

}