<?

class api_themes2
{


    var $version = 4;


    function get($args, $decode_variables = false)
    {
        $sql = "
                SELECT
                    *
                FROM
                    themes2
                WHERE
                    id = %id%";
        $res = $this->db->get_first($sql, $args);

        if ($decode_variables) {
            $this->dialog->useAppAPI('styles_manager/site_styles');
            $res["colors"] = $this->dialog->site_styles->decodeVariables($res["colors"], "colors");
            $res["fonts"] = $this->dialog->site_styles->decodeVariables($res["fonts"], "fonts");
        }

        return $res;
    }


    function getList()
    {

        $sql = "
                SELECT
                    id,
                    title,
                    thumb,
                    colors,
                    fonts
                FROM
                    themes2
                ORDER BY
                    title";
        $res = $this->db->get_list($sql);

        for ($i = 0; $i < count($res); $i++) {
            if ($res[$i]["thumb"]) {
                $res[$i]["thumb_path"] = $this->getThemeDir($res[$i]) . $res[$i]["thumb"];
            } else {
                $res[$i]["thumb_path"] = "/static/blank.gif";
            }
        }
        return $res;
    }


    // $args: { title: str, thumb: str, fonts: str, color: str, styles_id: int }
    function create($args, $site_files_dir = false)
    {
        global $config;

        $sql = "
                INSERT INTO
                    themes2
                    (
                    title,
                    thumb,
                    fonts,
                    colors
                    )
                VALUES
                    (
                    %title%,
                    %thumb%,
                    %fonts%,
                    %colors%
                    )";
        $this->db->query($sql, $args);
        $args["id"] = $this->db->insert_id();
        $theme_dir = $this->getThemeDir($args);
        if (!file_exists($theme_dir)) {
            mkdir($theme_dir, $config["unix_file_mode"], true);
        }

        if ($site_files_dir && $args["thumb"]) {
            $this->createThumb($site_files_dir . $args["thumb"], $theme_dir . $args["thumb"]);
        }

        $this->setThemeStyles($args, false);

        return $args["id"];
    }


    function linkStyleToTheme($args)
    {
        $sql = "
                INSERT INTO
                    themes2css_styles
                    (
                    theme_id,
                    css_style_id,
                    is_default
                    )
                VALUES
                    (
                    %theme_id%,
                    %css_style_id%,
                    %is_default%
                    )";
        $this->db->query($sql, $args);
    }


    function unlinkStyleFromTheme($args)
    {
        $sql = "
                DELETE FROM
                    themes2css_styles
                WHERE
                    theme_id = %theme_id% AND
                    css_style_id = %css_style_id%";
        $this->db->query($sql, $args);
    }


    function setThemeStyles($args, $clear_styles = false)
    {
        if ($clear_styles) {
            $sql = "
                    DELETE FROM
                        themes2css_styles
                    WHERE
                        theme_id = %theme_id%";
            $this->db->query($sql, $args["id"]);
        }

        $p = array(
            "theme_id" => $args["id"]
        );
        for ($i = 0; $i < count($args["styles"]); $i++) {
            $style = $args["styles"][$i];
            $p["css_style_id"] = $style["id"];
            $p["is_default"] = $style["is_default"];
            $this->linkStyleToTheme($p);
        }
    }


    function update($args, $site_files_dir = false)
    {
        global $config;

        if ($site_files_dir) {
            $old_data = $this->get($args);
        }

        $fields = array(
            "title",
            "thumb",
            "colors",
            "fonts"
        );


        $fsql = array();
        foreach ($fields as $f) {
            if (isset($args[$f])) {
                $fsql[] = $f . " = %" . $f . "%";
            }
        }


        if (count($fsql)) {
            $sql = "
                    UPDATE
                        themes2
                    SET 
                        " . implode(",", $fsql) . "
                    WHERE
                        id = %id%";
            $this->db->query($sql, $args);
        }

        if ($site_files_dir) {
            if ($old_data["thumb"] != $args["thumb"]) {
                $theme_dir = $this->getThemeDir($args);
                if (!empty($old_data["thumb"])) {
                    @unlink($theme_dir . $old_data["thumb"]);
                }
                if ($args["thumb"]) {
                    if (!file_exists($theme_dir)) {
                        mkdir($theme_dir, $config["unix_file_mode"], true);
                    }
                    $this->createThumb($site_files_dir . $args["thumb"], $theme_dir . $args["thumb"]);
                }
            }
        }

        if ($args["styles"]) {
            $this->setThemeStyles($args, true);
        }
    }


    function createThumb($src_file, $dst_file)
    {
        global $config;
        set_time_limit(120);
        include("system/wideimage/WideImage.inc.php");
        $image = wiImage::load($src_file);
        if ($image) {
            $image = $image->resize($config["theme_thumbs_size"]["width"], $config["theme_thumbs_size"]["height"], "fill");
            $image->saveToFile($dst_file);
            $image = null;
        }
    }


    function delete($args)
    {
        if (!$this->get($args)) return;

        $sql = "
                DELETE FROM
                    themes2
                WHERE
                    id = %id%";
        $this->db->query($sql, $args);


        $sql = "
                DELETE FROM
                    themes2css_styles
                WHERE
                    theme_id = %id%";
        $this->db->query($sql, $args);


        $this->dialog->useAPI("filesystem");
        $dir = $this->getThemeDir($args);
        $this->dialog->filesystem->deleteDir($dir);
    }


    // $args: { id: int,  version_id: int, layout_mode: "pc"|"mobile" }
    function applyToSite($args)
    {
        $theme = $this->get($args["id"]);
        if (!$theme) return;

        $sql = "
                UPDATE
                    sites
                SET
                    theme = 0,
                    custom_theme_id = 0";
        $this->db->query($sql, $args);

        $p = array(
            "mode" => "edit"
        );
        $p[$args["layout_mode"] . "_theme_id"] = $args["id"];
        $p[$args["layout_mode"] . "_fonts"] = $theme["fonts"];
        $p[$args["layout_mode"] . "_colors"] = $theme["colors"];
        $this->dialog->site_versions->update($p);


        // apply default styles
        $default_styles = $this->getDefaultStyles($args["id"]);

        $p2 = array(
            "version_id" => $args["version_id"]
        );

        $sql = "
                UPDATE
                    pages
                SET
                    " . $args["layout_mode"] . "_style_id = %style_id%
                WHERE
                    version_id = %version_id%";
        $p2["style_id"] = $default_styles["page_body"];
        $this->db->query($sql, $p2);


        $sql = "
                SELECT
                    lr2p.row_id,
                    lr2p.position,
                    lr." . $args["layout_mode"] . "_data as data,
                    lr." . $args["layout_mode"] . "_style_id as style_id
                FROM
                    layout_rows2pages as lr2p
                LEFT JOIN
                    layout_rows as lr
                ON
                    lr.id = lr2p.row_id
                WHERE
                    lr2p.version_id = %version_id% AND
                    lr2p.owner = 1";
        $rows = $this->db->get_list($sql, $p2);


        $sql = "
                UPDATE
                    layout_rows
                SET
                    " . $args["layout_mode"] . "_style_id = %style_id%,
                    " . $args["layout_mode"] . "_data = %data%
                WHERE
                    id = %row_id%";
        foreach ($rows as $row) {
            $new_style_id = $default_styles["layout_row" . $row["position"]];
            if ($new_style_id) {
                $row["style_id"] = $new_style_id;
            }
            $row["data"] = $this->dialog->json->decode($row["data"]);
            if (is_array($row["data"]["apps"])) {
                foreach ($row["data"]["apps"] as $app_id => $app_info) {
                    $new_style_id = $default_styles[$this->getStyleKey($app_info["name"])];
                    if ($new_style_id) {
                        $row["data"]["profiles"][$app_id]["theme2_style_id"] = $new_style_id;
                    }
                }
            }
            $row["data"] = $this->dialog->json->encode($row["data"]);
            $this->db->query($sql, $row);
        }
    }


    function getStyleKey($app_name)
    {
        if (!$this->style_keys_transition) {
            require("themes_v2/conf/style_keys_transition.php");
        }
        return $this->style_keys_transition[$app_name] ? $this->style_keys_transition[$app_name] : $app_name;
    }


// files
    function getThemeDir($args)
    {
        global $config;
        return $config["storage"] . ".css/themes/" . $args["id"] . "/";
    }


// import/export

    function getStylesInfo($args)
    {
        $sql = "
                SELECT
                    ts.css_style_id as id,
                    ts.is_default,
                    cs.key,
                    cs.title
                FROM
                    themes2css_styles as ts
                LEFT JOIN
                    css_styles as cs
                ON
                    cs.id = ts.css_style_id 
                WHERE
                    ts.theme_id = %id%";
        return $this->db->get_list($sql, $args);
    }


    function getStylesList($args)
    {
        $sql = "
                SELECT
                    css_style_id as id,
                    is_default
                FROM
                    themes2css_styles
                WHERE
                    theme_id = %id%";
        return $this->db->get_list($sql, $args);
    }


    function getDefaultStyles($theme_id)
    {
        $sql = "
                SELECT
                    ts.css_style_id as id,
                    cs.key
                FROM
                    themes2css_styles as ts
                LEFT JOIN
                    css_styles as cs
                ON
                    cs.id = ts.css_style_id 
                WHERE
                    ts.theme_id = %id%";
        $rows = $this->db->get_list($sql, $theme_id);
        $res = array();
        foreach ($rows as $row) {
            $res[$row["key"]] = $row["id"];
        }
        return $res;
    }




// save&load to file


    // $pointer: { id: int }
    // return filename with path
    function saveToFile($pointer, $out_dir)
    {
        global $config;

        $theme = $this->get($pointer);
        if (!$theme) return false;

        $styles = $this->getStylesInfo($pointer);

        // file name
        $file_name = trim($theme["title"]);
        $file_name = preg_replace('/\s+/', "_", $file_name);
        $file_name = preg_replace('/[^a-zA-Z0-9-_]/', "", $file_name);
        if (strlen($file_name) == 0) {
            $file_name = "websemble_theme";
        }
        $file_name .= "_" . $theme["id"];

        $zip_file_name = $out_dir . $file_name . ".wst" . $this->version;
        if (file_exists($zip_file_name)) {
            unlink($zip_file_name);
        }

        $zip = new ZipArchive;
        $res = $zip->open($zip_file_name, ZipArchive::CREATE);
        if ($res !== true) return false;


        $this->dialog->useAPI("css_styles");

        $theme_data = array(
            "version" => $this->version,
            "title" => $theme["title"],
            "thumb" => $theme["thumb"],
            "fonts" => $theme["fonts"],
            "colors" => $theme["colors"],
            "styles" => array()
        );


        if ($theme_data["thumb"]) {
            $theme_thumb = $this->getThemeDir($pointer) . $theme_data["thumb"];
            if (file_exists($theme_thumb)) {
                $zip->addFile($theme_thumb, $theme_data["thumb"]);
            }
        }


        for ($i = 0; $i < count($styles); $i++) {
            $style = $this->dialog->css_styles->get($styles[$i]["id"]);
            $style_data = array(
                "id" => $style["id"],
                "key" => $styles[$i]["key"],
                "type" => $styles[$i]["type"],
                "data" => $style["data"],
                "title" => $style["title"],
                "thumb" => $style["thumb"],
                "files" => array()
            );


            if ($style["thumb"]) {
                $style_data["files"][] = $style["thumb"];
            }

            $style_dir = $this->dialog->css_styles->getFolder($style);
            foreach (scandir($style_dir) as $file) {
                if ($file == "." || $file == "..") continue;
                $pi = pathinfo($style_dir . $file);
                if ($pi["extension"] != "css") {
                    $style_data["files"][] = $file;
                }
            }
            if (count($style_data["files"]) > 0) {
                $zip_style_dir = "style" . $i . "/";
                $zip->addEmptyDir($zip_style_dir);
                foreach ($style_data["files"] as $file) {
                    $zip->addFile($style_dir . $file, $zip_style_dir . $file);
                }
            }
            $theme_data["styles"][] = $style_data;
        }

        $zip->addFromString("theme.serialized", serialize($theme_data));
        $zip->close();
        return $zip_file_name;
    }


    // $args: {  file: str, new_title: str }
    function loadFromFile($args)
    {
        // open zip
        $zip = new ZipArchive;
        if ($zip->open($args["file"]) === false ||
            $zip->locateName("theme.serialized") === false
        ) {
            return false;
        }

        // extract to tmp folder
        $tmp_dir_name = tempnam("wst" . $this->version, "");
        if (!file_exists($tmp_dir_name)) return false;
        unlink($tmp_dir_name);
        @mkdir($tmp_dir_name);
        if (!is_writable($tmp_dir_name)) return false;
        $tmp_dir_name .= "/";
        $zip->extractTo($tmp_dir_name);
        $zip->close();


        $theme_data_file = $tmp_dir_name . "theme.serialized";
        $theme_data = unserialize(file_get_contents($theme_data_file));
        if (!$theme_data || $theme_data["version"] != $this->version) return false;


        // create theme
        $p = array(
            "title" => $theme_data["title"],
            "thumb" => $theme_data["thumb"],
            "fonts" => $theme_data["fonts"],
            "colors" => $theme_data["colors"]
        );

        if ($args["new_title"]) {
            $p["title"] = $args["new_title"];
        }
        $theme_id = $this->create($p);

        if ($theme_data["thumb"]) {
            $p["id"] = $theme_id;
            @copy($tmp_dir_name . $theme_data["thumb"], $this->getThemeDir($p) . $theme_data["thumb"]);
        }


        // create styles
        $this->dialog->useAPI("css_styles");
        for ($i = 0; $i < count($theme_data["styles"]); $i++) {
            $style = $theme_data["styles"][$i];

            if ($style["type"] == "user") {
                // create style
                $style["id"] = $this->dialog->css_styles->create($style);

                // copy files
                if (count($style["files"]) > 0) {
                    $tmp_style_dir = $tmp_dir_name . "style" . $i . "/";
                    $style_dir = $this->dialog->css_styles->getFolder($style);
                    foreach ($style["files"] as $file) {
                        @copy($tmp_style_dir . $file, $style_dir . $file);
                    }
                }
            }

            $p = array(
                "css_style_id" => $style["id"],
                "theme_id" => $theme_id,
                "is_default" => $style["is_default"]
            );
            $this->linkStyleToTheme($p);
        }

        $this->dialog->useAPI("filesystem");
        $this->dialog->filesystem->deleteDir($tmp_dir_name);
        return true;
    }



    //  $src_site: { id: int}
    //  $dst_site: { id: int}
    function copySiteThemes($src_site, $dst_site, &$sconv)
    {
        $res = array();

        $sql = "
                SELECT
                    *
                FROM
                    themes2";
        $src_themes = $this->db->get_list($sql, $src_site);
        foreach ($src_themes as $theme) {
            $src_theme_styles = $this->getStylesList($theme);

            $old_theme_dir = $this->getThemeDir($theme);
            $old_theme_id = $theme["id"];

            unset($theme["id"]);
            $theme["styles"] = array();


            foreach ($src_theme_styles as $style) {
                $theme["styles"][] = array(
                    "id" => isset($sconv[$style["id"]]) ? $sconv[$style["id"]] : $style["id"],
                    "is_default" => $style["is_default"]
                );
            }

            $theme["id"] = $this->create($theme);
            $res[$old_theme_id] = $theme["id"];

            if (file_exists($old_theme_dir . $theme["thumb"])) {
                @copy($old_theme_dir . $theme["thumb"], $this->getThemeDir($theme) . $theme["thumb"]);
            }
        }
        return $res;
    }

}

?>