<?

class dialog_controller_themes extends dialog_controller
{
    public $appAPIs = [
        'themes/themes'
    ];

    var $APIs = array(
        "custom_themes",
        "js_compiler",
    );


    function run()
    {
        parent::run();

        if ($this->usertype < USERTYPE_ADMIN) {
            return array("status" => "error");
        }

        switch ($_GET["act"]) {
            case "get_categories":
                return $this->themes->getCategories();
                break;

            case "get_themes":
                $res = array(
                    "category" => $_GET["category"]
                );
                if ($_GET["type"] == "custom") {
                    $res["data"] = $this->custom_themes->getList();
                } else {
                    $res["data"] = $this->themes->getList($_GET["category"]);
                }
                return $res;
                break;

            case "set_theme":
                $args = array(
                    "theme_id" => $_REQUEST["theme_id"]
                );
                if ($_REQUEST["is_custom"] == 1) {
                    $this->custom_themes->applyToSite($args);
                } else {
                    $this->themes->applyToSite($args);
                }

                return true;
                break;

            case "install":
                $this->custom_category_id = $this->themes->getCustomCategoryId();
                if ($this->custom_category_id == null) {
                    return $this->status("error", "Server error");
                }
                $res = $this->installTheme();
                if ($res["status"] == "ok") {
                    $res["data"] = $this->custom_themes->getList();
                    $res["category"] = $this->custom_category_id;
                }
                return $res;
                break;


            case "delete":
                $args = array(
                    "id" => $_REQUEST["theme_id"]
                );
                $this->custom_themes->delete($args);

                $res = array(
                    "status" => "ok"
                );
                if ($_REQUEST["load_list"] == 1) {
                    $res["data"] = $this->custom_themes->getList();
                    $this->custom_category_id = $this->themes->getCustomCategoryId();
                    $res["category"] = $this->custom_category_id;
                }
                return $res;
                break;
        }

        return array("status" => "error");
    }


    function installTheme()
    {
        global $config;

        $file = $config["storage"] . "/" . $_REQUEST["file"];
        if (!file_exists($file)) {
            return $this->status("error", "File not found");
        }

        $theme_name = str_replace(".zip", "", strtolower($_REQUEST["file"]));
        $theme_name = str_replace("..", "", $theme_name);


        $zip = new ZipArchive;
        if (!$zip) {
            return $this->status("error", "Server error (ZIP lib)");
        } else {
            if ($zip->open($file) === false) {
                return $this->status("error", "Can't open archive");
            } else if ($zip->numFiles == 0) {
                return $this->status("error", "Empty archive");
            } else {
                if ($zip->locateName("thumb.jpg") === false ||
                    $zip->locateName("theme.css") === false ||
                    $zip->locateName("theme.js") === false
                ) {
                    return $this->status("error", "Incorrect theme format");
                } else {

                    // prepare custom themes dir
                    $theme_folder = "custom_themes/" . $this->site_owner["id"];
                    if (!file_exists($theme_folder)) {
                        @mkdir($theme_folder);
                        if (!is_writable($theme_folder)) {
                            return $this->status("error", "Server error (Can't create theme folder)");
                        }
                    }
                    $theme_folder .= "/" . $theme_name;
                    if (!file_exists($theme_folder)) {
                        @mkdir($theme_folder);
                        if (!is_writable($theme_folder)) {
                            return $this->status("error", "Server error (Can't create theme folder)");
                        }
                    }

                    $zip->extractTo($theme_folder);
                    $zip->close();


                    $p = array(
                        "category" => $this->custom_category_id,
                        "title" => $theme_name,
                        "name" => $theme_name
                    );

                    $description_file = $theme_folder . "/description.ini";
                    if (file_exists($description_file)) {
                        $description = parse_ini_file($description_file);
                        if ($description["title"]) {
                            $p["title"] = $description["title"];
                        }
                    }
                    $theme_id = $this->custom_themes->install($p);


                    // compile files
                    $this->compile($theme_folder, "all");
                    $this->compile($theme_folder, "editor");
                    $this->compile($theme_folder, "ie6fix");


//                        $this->updateCSSFiles($theme_name);
//                        return $this->status("ok");
                    return array(
                        "status" => "ok",
                        "id" => $theme_id,
                        "name" => $p["name"]
                    );
                }
            }
        }
    }


    function compile($theme_dir, $mode)
    {
        global $config;
        require("themes/.default/config.php");

        $def_dir = "themes/.default/";
        $src_dir = $theme_dir . "/";
        $outfile = $theme_dir . "/_" . $mode . ".css";

        $f = fopen($outfile, "w");
        if (!$f) return false;
        @chmod($outfile, $config["unix_file_mode"]);

        $flist = $css_files[$mode];

        if (!$flist) return false;

        for ($i = 0; $i < count($flist); $i++) {
            $sfile = $src_dir . $flist[$i];
            if (!file_exists($sfile)) {
                $sfile = $def_dir . $flist[$i];
            }
            fwrite($f, $this->js_compiler->packCSS($sfile));
        }

        fclose($f);
        return true;
    }


    function status($value, $msg = "")
    {
        return array(
            "status" => $value,
            "msg" => $msg
        );
    }


}


?>