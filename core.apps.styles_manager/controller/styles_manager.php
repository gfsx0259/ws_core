<?php

class dialog_controller_styles_manager extends dialog_controller
{

    public $appAPIs = [
        'themes/themes2',
        'styles_manager/site_styles'
    ];


    var $APIs = array(
        "css_styles"
    );


    function run()
    {
        parent::run();

        if ($this->usertype < USERTYPE_ADMIN) {
            return array("status" => "error");
        }

        global $config;

        switch ($_REQUEST["act"]) {
            case "get_styles_list":
                $res = array(
                    "status" => "ok"
                );
                if ($_REQUEST["key"]) {
                    $res["title"] = $this->css_styles->getStyleTitleByKey($_REQUEST["key"]);
                    $res["data"] = $this->getStylesList();
                }
                if ($_REQUEST["load_theme_styles"]) {
                    $p = array(
                        "id" => $this->site_version[$this->layout_mode . "_theme_id"]
                    );
                    $res["theme_styles"] = $this->themes2->getStylesInfo($p);
                }

                if ($_REQUEST["load_styles_per_pages"]) {
                    $p = array(
                        "layout_mode" => $this->layout_mode
                    );
                    $res["styles_per_pages"] = $this->site_styles->getStylesPerPages($p);
                }
                return $res;
                break;


            case "get_style_data":
                $res = array(
                    "status" => "ok"
                );

                if ($_REQUEST["id"] != "null") {
                    $res["data"] = $this->css_styles->getEditorData($_REQUEST["id"]);
                } else {
                    $res["data"] = $this->css_styles->getEditorDefaultData($_REQUEST["key"]);
                }
                return $res;
                end;


            case "create_style":
                $p = array(
                    "title" => $_REQUEST["title"],
                    "thumb" => $_REQUEST["thumb"],
                    "key" => $_REQUEST["key"],
                    "data" => unserialize($_REQUEST["data"])
                );

                $site_files_dir = $this->getSiteFilesDir();
                $p["css_style_id"] = $this->css_styles->create($p, $site_files_dir);

                return array(
                    "status" => "ok",
                    "key" => $_REQUEST["key"],
                    "style_id" => $p["css_style_id"],
                    "data" => $this->getStylesList()
                );
                break;


            case "update_style":
                $p = array(
                    "title" => $_REQUEST["title"],
                    "thumb" => $_REQUEST["thumb"],
                    "key" => $_REQUEST["key"],
                    "data" => unserialize($_REQUEST["data"]),
                    "id" => $_REQUEST["id"]
                );
                $site_files_dir = $this->getSiteFilesDir();
                $this->css_styles->update($p, $site_files_dir);

                $this->site_versions->setChanged($this->site_version["id"]);

                return array(
                    "status" => "ok",
                    "style_id" => $p["id"],
                    "data" => $this->getStylesList()
                );
                break;


            case "delete_style":
                $p = array(
                    "id" => $_REQUEST["id"],
                    "version_id" => $this->site_version["id"]
                );
                $this->css_styles->delete($p);
//                    $this->site_styles->setChanged($p);

                return array(
                    "status" => "ok",
                    "style_id" => $_REQUEST["id"],
                    "data" => $this->getStylesList()
                );
                break;


            case "use_style":

//                todo;
                $theme_id = $this->site_version[$this->layout_mode . "_theme_id"];
                $p = array(
                    "theme_id" => $theme_id,
                    "css_style_id" => $_REQUEST["id"],
                    "type" => $_REQUEST["type"]
                );
                $this->themes2->linkStyleToTheme($p);
//                    $this->themes2->setChanged($theme_id);

                return array(
                    "status" => "ok"
                );
                break;


            case "link_style":
                $theme_id = $this->site_version[$this->layout_mode . "_theme_id"];
                $p = array(
                    "theme_id" => $theme_id,
                    "css_style_id" => (int)$_REQUEST["old_style_id"],
                    "type" => $_REQUEST["type"]
                );
                if ($p["css_style_id"]) {
                    $this->themes2->unlinkStyleFromTheme($p);
                }
                $p["css_style_id"] = (int)$_REQUEST["new_style_id"];
                if ($p["css_style_id"]) {
                    $this->themes2->linkStyleToTheme($p);
                }

                $this->themes2->setChanged($theme_id);

                return array(
                    "status" => "ok"
                );

                break;

            case "set_colors":
                $p = array(
                    "mode" => "edit"
                );
                $p[$this->layout_mode . "_colors"] = $_REQUEST["colors"];
                $this->site_versions->update($p);

                return array(
                    "status" => "ok"
                );
                break;

            case "set_fonts":
                $p = array(
                    "mode" => "edit"
                );
                $p[$this->layout_mode . "_fonts"] = $_REQUEST["fonts"];
                $this->site_versions->update($p);

                return array(
                    "status" => "ok"
                );
                break;
        }

    }


    function getStylesList()
    {
        global $config;
        $p = array(
            "key" => $_REQUEST["key"]
        );
        if ($p["key"]) {
            $res = $this->css_styles->getList($p);
        }
        return $res;
    }


    function getSiteFilesDir()
    {
        global $config;
        return $config["storage"] . "/";
    }

}

?>