<?

class api_site_menu
{


    var $item_num = 0;

    function get($args, $page_name = null, $skip_html = false)
    {
        $sql = "
                SELECT
                    data_js,
                    data_php,
                    flags
                FROM
                    menus
                WHERE
                    version_id = %version_id%";
        $res = $this->db->get_first($sql, $args);

        $this->body_menu_id = null;

        if ($res) {
            $res["data_php"] = unserialize($res["data_php"]);
            // TODO: use json inly
            if (!$res["data_php"] && $res["data_js"]) {
                $this->dialog->useAPI("json");
                $res["data_php"] = $this->dialog->json->decode(str_replace("\'", "'", $res["data_js"]));
            }
            if (!$skip_html) {
                $res["data_html"] = $this->getSiteMenuHTML($res["data_php"], $page_name);
                $res["data_html_v2"] = $this->getMenuNodeHTML($res["data_php"], $page_name);
                $res["body_data_html"] = $this->getBodyMenuHTML($res["data_php"], $page_name);
            }
            if ($page_name) {
                if ($this->active_item) {
                    $res["active_item"] = $this->active_item;
                } else {
                    $res["active_item"] = $this->getActiveItem($res["data_php"], $page_name);
                }
            }
        } else {
            $res = array(
                "data_php" => array(),
                "data_js" => "[]",
                "data_html" => "",
                "flags" => ""
            );
        }
        return $res;
    }


    // data: {  version_id, data_js, [data_php] }
    function set($data)
    {
        $data["data_php"] = serialize($data["data_php"]);
        $sql = "
                INSERT INTO
                    menus
                    (version_id, data_js, data_php, flags)
                VALUES
                    (%version_id%, %data_js%, %data_php%, %flags%)
                ON DUPLICATE KEY UPDATE
                    data_js = %data_js%, 
                    data_php = %data_php%,
                    flags = %flags%";
        $this->db->query($sql, $data);
    }



    // Main menu HTML
    // call before getBodyMenuHTML
    function getSiteMenuHTML(&$data, $page_name = null)
    {
        $html = "<ul>";

        $cnt = count($data);
        for ($i = 0; $i < $cnt; $i++) {
            $mi = $data[$i];

            if ($mi["default_body_menu"]) $this->body_menu = $mi;
//                if($mi["published"] == 0 && $mi["type"] != "external") continue;
            if ($mi["visible"] == "0") continue;
            if ($mi["access_mode"] == "admin" && $this->dialog->usertype < USERTYPE_ADMIN) continue;


            // li
            $html .= "<li ";
            $li_class = count($mi["childs"]) ? "parent" : "";
            $li_class .= $mi["url"] == $page_name ? " active" : "";

            if ($i == 0) {
                $html .= "class='first " . $li_class . "' ";
            } else if ($i == $cnt - 1) {
                $html .= "class='last " . $li_class . "' ";
            } else if ($li_class) {
                $html .= "class='" . $li_class . "' ";
            }
            $html .= ">";

            // a || span
            $html .= $this->getSiteMenuItemHTML($mi, $page_name);


            // submenu
            if (count($mi["childs"])) {
                $sub_html = "";
                for ($j = 0; $j < count($mi["childs"]); $j++) {
                    $sub_html .= $this->getSiteMenuItemHTML($mi["childs"][$j], $page_name);
                }
                if ($sub_html != "") {
                    $html .= "<div class='submenu' style='display: none' id='site_submenu" . $this->item_num . "'>" . $sub_html . "</div>";
                }
            }

            // li
            $html .= "</li>";

            $this->item_num++;
        }
        return $html . "</ul>";
    }


    function getSiteMenuItemHTML(&$mi, $page_name,$level=false)
    {
        $unlimitedContainerClass = 'unlimited_container';

        if ($mi["body_menu"] && $mi["url"] == $page_name) {
            $this->body_menu_id = $mi["body_menu"];
        }
        if ($mi["visible"] == 0) return "";
        //if ($mi["access_mode"] == "admin" && $this->dialog->usertype < USERTYPE_ADMIN) return "";

        $html = "";
        $url = $mi["url"];
        $title = $mi["title"] . ($mi["hint"] ? "<span class='second_line'>" . $mi["hint"] . "</span>" : "");

        if ($url == $page_name) {
            $html .= "<span class='selected'>" . $title . "</span>";
            $this->active_item = array(
                "title" => $mi["title"],
                "hint" => $mi["hint"]
            );
        } else {
            $url = $this->formatItemURL($mi);
            $target = $mi["blank_page"] == 1 ? "target='_blank'" : "";
            $html .= "<a href='" . $url . "' " . $target . ">" . $title . "</a>";
        }

            $wrapper = '';
            $level ? $num = (int)$level+1 : $num = 1;
            $num %2 == 0 ? $extra='even': $extra='not_even';
            //if submenu item have child items
            if(count($mi["childs"])>0 && $mi['level']>0){
                foreach($mi["childs"] as $item){
                  $wrapper.= $this->getSiteMenuItemHTML($item,$page_name,$num);
                }
                return "<div class=\"$unlimitedContainerClass $extra\">".$html.$wrapper."</div>";
            }
            //if it's wrapper for unlimited sub menus, need for style of position
            if($level){
                return "<div class=\"$unlimitedContainerClass $extra\">".$html."</div>";
            }

        return $html;
    }


    // Body menu HTML

    function getBodyMenuHTML(&$data, $page_name = null)
    {
        if ($this->body_menu_id != null) {
            $this->body_menu = $this->findItem($data, $this->body_menu_id);
            if ($this->body_menu["access_mode"] == "admin" && $this->dialog->usertype < USERTYPE_ADMIN) {
                $this->body_menu_id = null;
                $this->body_menu = null;
            }
        }
        $html = "";
        if ($this->body_menu) {
            for ($i = 0; $i < count($this->body_menu["childs"]); $i++) {
                $html .= $this->getBodyMenuItemHTML($this->body_menu["childs"][$i], $page_name);
            }
        }
        return "<ul class='submenu'>" . $html . "</ul>";
    }


    function getBodyMenuItemHTML(&$mi, $page_name)
    {
        if ($mi["access_mode"] == "admin" && $this->dialog->usertype < USERTYPE_ADMIN) return "";
        $html = "<li>";

        $title = $mi["hint"] ? "<strong>" . $mi["title"] . "</strong> " . $mi["hint"] : $mi["title"];
        $url = $mi["url"];
        if ($url == $page_name) {
            $ihtml .= "<span>" . $title . "</span>";
            $shtml = " class='active'";
        } else {
            $url = $this->formatItemURL($mi);
            $target = $mi["blank_page"] == 1 ? "target='_blank'" : "";
            $ihtml .= "<a href='" . $url . "' " . $target . ">" . $title . "</a>";
            $shtml = "";
        }

        $list = $mi["childs"];
        $drop_down_html = "";
        if (count($list)) {
            for ($i = 0; $i < count($list); $i++) {
                $url = $list[$i]["url"];
                if ($url == $page_name) {
                    $drop_down_html .= "<span>" . $list[$i]["title"] . "</span>";
                } else {
                    $url = $this->formatItemURL($list[$i]);
                    $target = $mi["blank_page"] == 1 ? "target='_blank'" : "";
                    $drop_down_html .= "<a href='" . $url . "' " . $target . ">" . $list[$i]["title"] . "</a>";
                }
            }
            $drop_down_html = "<div class='drop_down' id='site_submenu" . $this->item_num . "'>" . $drop_down_html . "</div>";
        }
        $this->item_num++;
        return "<li " . $shtml . ">" . $ihtml . $drop_down_html . "</li>";
    }


    function &findItem(&$data, $id)
    {
        for ($i = 0; $i < count($data); $i++) {
            $mi = $data[$i];
            if ($mi["id"] == $id) return $mi;
            $res = $this->findItem($mi["childs"], $id);
            if ($res) return $res;
        }
        return false;
    }


    function getActiveItem(&$data, $page_name)
    {
        foreach ($data as $item) {
            if ($item["url"] == $page_name) {
                $res = array(
                    "title" => $item["title"],
                    "hint" => $item["hint"]
                );
                break;
            } else if (count($item["childs"])) {
                $res = $this->getActiveItem($item["childs"], $page_name);
            }
        }
        return $res;
    }


    // V2 - migration to menu2 vidget

    function getMenuNodeHTML(&$data, $page_name = null, $id = "")
    {
        $html = "<div id='site_menu_node$id'><ul>";

        $last = count($data) - 1;
        for ($i = 0; $i <= $last; $i++) {
            $item =& $data[$i];

            if ($item["visible"] == "0" || ($item["access_mode"] == "admin" && $this->dialog->usertype < USERTYPE_ADMIN)) continue;

            // li
            $css_classes = array();
            if ($item["url"] == $page_name) {
                $css_classes[] = "active";
            }
            if (count($item["childs"])) {
                $css_classes[] = "parent";
            }
            if ($i == 0) {
                $css_classes[] = "first";
            } else if ($i == $last) {
                $css_classes[] = "last";
            }

            if (count($css_classes)) {
                $css_classes = "class='" . implode(" ", $css_classes) . "'";
            } else {
                $css_classes = "";
            }


            $url = $this->formatItemURL($item);
            $target = $item["blank_page"] == 1 ? " target='_blank'" : "";

            $html .= "<li $css_classes id='site_menu_li" . $item["id"] . "'><a href='$url' $target>" . $item["title"];
            if ($item["hint"]) {
                $html .= "<span>" . $item["hint"] . "</span>";
            }
            $html .= "</a>";


            // submenu
            if (count($item["childs"])) {
                $html .= $this->getMenuNodeHTML($item["childs"], $page_name, $item["id"]);
            }

            // li
            $html .= "</li>";
        }
        return $html . "</ul></div>";
    }


    function formatItemURL($item)
    {
        $url = $item["url"];
        $type = $item["type"];
        if ($url == "") {
            $url = "javascript:void(0)";
        } else if ($type == "std" || $type == "doc") {
            $url = "/" . $url . ".html";
        } else if ($type != "external") {
            $url = "/" . $url;
        }
        return $url;
    }


}

?>