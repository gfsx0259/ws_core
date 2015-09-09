<?

class api_site_styles
{


    var $default_variables = array(
        "colors" => array(
            "text-color" => "FFF",
            "heading-color" => "FFF",
            "background-color1" => "FFF",
            "background-color2" => "FFF",
            "extra-color" => "FFF"
        ),
        "fonts" => array(
            "main-font" => "Arial, Helvetica, sans-serif",
            "heading-font" => "Arial, Helvetica, sans-serif",
            "fancy-font" => "Arial, Helvetica, sans-serif"
        )
    );


    function decodeVariables($data, $key)
    {
        if (!empty($data)) {
            $res = $this->dialog->json->decode($data);
        }
        if (!$res) {
            $res = $this->default_variables[$key];
        }
        return $res;
    }

    // $args: {  version_id: int, layout_mode: "pc"|"mobile" }
    function collectSiteStyles($args)
    {
        $res = array();

        $sql = "
                SELECT
                    " . $args["layout_mode"] . "_style_id
                FROM
                    pages
                WHERE
                    version_id = %version_id%";
        $ids = $this->db->get_vector($sql, $args);
        foreach ($ids as $id) {
            if ($id) $res[$id] = true;
        }

        $sql = "
                SELECT
                    pc_style_id,
                    pc_used_styles,
                    pc_data,
                    mobile_style_id,
                    mobile_used_styles,
                    mobile_data
                FROM
                    layout_rows
                WHERE
                    version_id = %version_id%";
        $rows = $this->db->get_list($sql, $args);

        foreach ($rows as $row) {
            if ($row["mobile_data"] == "" && $args["layout_mode"] == "mobile") {
                $row_style_id = $row["pc_style_id"];
                $row_used_styles = $row["pc_used_styles"];
            } else {
                $row_style_id = $row[$args["layout_mode"] . "_style_id"];
                $row_used_styles = $row[$args["layout_mode"] . "_used_styles"];
            }
            if ($row_style_id) $res[$row_style_id] = true;
            $tmp = explode(";", $row_used_styles);
            foreach ($tmp as $id) {
                if ($id) $res[$id] = true;
            }
        }

        $res = array_keys($res);
        $res = array_unique($res);
        return $res;
    }


    // $args: {  layout_mode: "pc"|"mobile" }
    function getStylesPerPages($args)
    {
        $res = array();

        $sql = "
                SELECT
                    " . $args["layout_mode"] . "_style_id as style_id,
                    id,
                    name
                FROM
                    pages
                WHERE
                    " . $args["layout_mode"] . "_style_id > 0";
        $rows = $this->db->get_list($sql, $args);
        foreach ($rows as $row) {
            if (!$res[$row["style_id"]]) {
                $res[$row["style_id"]] = array();
            }
            $res[$row["style_id"]][$row["id"]] = $row["name"];
        }


        $sql = "
                SELECT
                    lr." . $args["layout_mode"] . "_style_id as style_id,
                    lr." . $args["layout_mode"] . "_used_styles as used_styles,
                    p.id,
                    p.name
                FROM
                    layout_rows2pages as lr2p
                JOIN
                    pages as p 
                ON
                    p.id = lr2p.page_id
                JOIN
                    layout_rows as lr
                ON
                    lr.id = lr2p.row_id";
        $rows = $this->db->get_list($sql, $args);


        foreach ($rows as $row) {
            if ($row["used_styles"] != "") {
                $styles = explode(";", $row["used_styles"]);
            } else {
                $styles = array();
            }
            if ($row["style_id"] > 0) {
                $styles[] = $row["style_id"];
            }

            foreach ($styles as $style_id) {
                if (!$res[$style_id]) {
                    $res[$style_id] = array();
                }
                $res[$style_id][$row["id"]] = $row["name"];
            }
        }
        return $res;
    }


    function getCSSFile($site_version, $layout_mode)
    {
        global $config;


        $dir = $config["storage"] . ".css/";

        $this->dialog->useAPI("filesystem");
        $this->dialog->filesystem->createDir($dir);

        $css_file = $dir . $site_version["id"] . "_" . $layout_mode . ".css";

        if (!file_exists($css_file) || filemtime($css_file) < $site_version["last_change"] || $config["common"]["dev_mode"]) {
            $f = fopen($css_file, "w");
            if (!$f) return false;
            @chmod($css_file, $config["unix_file_mode"]);


            $css_variables = array();
            foreach ($site_version[$layout_mode . "_colors"] as $k => $v) {
                $css_variables["[" . $k . "]"] = "#" . $v;
            }
            foreach ($site_version[$layout_mode . "_fonts"] as $k => $v) {
                $css_variables["[" . $k . "]"] = $v;
            }


            $this->dialog->useAPI("css_styles");


            $p = array(
                "version_id" => $site_version["id"],
                "layout_mode" => $layout_mode
            );
            $ids = $this->collectSiteStyles($p);

            $this->dialog->useAppAPI("themes/themes2");
            $theme_default_styles = $this->dialog->themes2->getDefaultStyles($site_version[$layout_mode . "_theme_id"]);
            foreach ($theme_default_styles as $key => $id) {
                $ids[] = $id;
            }

            $ids = array_unique($ids);

            $css = "";
            foreach ($ids as $id) {
                if (!$id) continue;
                $css .= $this->dialog->css_styles->getCSS($id);
            }


            /*
            varp($styles);
//dimk

            $default_styles = array_unique(array_values($row[$args["layout_mode"]."_default_styles"]));
            $default_css = array();
            foreach($default_styles as $id) {
                if($id) {
                    $res = $this->dialog->css_styles->getCSS($id, true, $css_variables);
                    $default_css[$res["key"]] = $res["css"];
                    $res = null;
                }
            }

            if($default_css["custom_code"]) {
                // must be before all css
                $css .= $default_css["custom_code"];
//                    fwrite($f, $default_css["custom_code"]);
                unset($default_css["custom_code"]);
            }
            foreach($default_css as $dcss) {
                $css .= $dcss;
//                    fwrite($f, $css);
            }

            $ids = array_unique($this->collectSiteStyles($args));
            foreach($ids as $id) {
                if($id) {
                    $res = $this->dialog->css_styles->getCSS($id, false, $css_variables);
                    $css .= $res["css"];
//                        fwrite($f, $res["css"]);
                }
            }
            */

            foreach ($css_variables as $k => $v) {
                $css = str_replace($k, $v, $css);
            }

            $css = $this->processFonts($css);

            fwrite($f, $css);
            fclose($f);
        }
        return $css_file;
    }


    function processFonts(&$css)
    {
        $sys_names = array(
            "serif" => 1,
            "sans-serif" => 1,
            "cursive" => 1,
            "fantasy" => 1,
            "monospace" => 1,
            "arial" => 1,
            "helvetica" => 1,
            "arial black" => 1,
            "gadget" => 1,
            "comic sans ms" => 1,
            "courier new" => 1,
            "courier" => 1,
            "georgia" => 1,
            "impact" => 1,
            "charcoal" => 1,
            "lucida console" => 1,
            "monaco" => 1,
            "lucida sans unicode" => 1,
            "lucida grande" => 1,
            "palatino linotype" => 1,
            "book antiqua" => 1,
            "palatino" => 1,
            "tahoma" => 1,
            "geneva" => 1,
            "times new roman" => 1,
            "times" => 1,
            "trebuchet ms" => 1,
            "verdana" => 1,
            "symbol" => 1,
            "webdings" => 1,
            "wingdings" => 1,
            "zapf dingbats" => 1,
            "ms sans serif" => 1,
            "ms serif" => 1,
            "new york" => 1
        );

        $used_fonts = array();

        // font-family: ...
        preg_match_all('~font-family:[\s]?([^;]+)~i', $css, $matches);
        foreach ($matches[1] as $fonts_str) {
            $fonts = explode(",", $fonts_str);
            foreach ($fonts as $font) {
                $font = trim($font);
                $font = str_replace(array("'", "\""), "", $font);
                if ($sys_names[strtolower($font)] || strpos($font, "[") !== false) continue;
                $used_fonts[$font] = 1;
            }
        }


        if (count($used_fonts) == 0) return $css;

        $font_css = "";
        foreach ($used_fonts as $font => $tmp) {
            $font = str_replace(" ", "+", $font);
            $font_css .= "@import url(//fonts.googleapis.com/css?family=" . $font . ");\n";
        }
        return $font_css . $css;
    }


    // $args: {  version_id: int }
    function deleteCSSFiles($args)
    {
        global $config;
        $path = $config["storage"] . ".css/" . $args["version_id"];
        @unlink($path . "_pc.css");
        @unlink($path . "_mobile.css");
    }


}

?>