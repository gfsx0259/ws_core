<?php

class dialog_controller_pages_manager extends dialog_controller
{

    public $appAPIs = [
        'menu/site_menu',
        'comments/comments',
        'texts_manager/site_texts',
        'layout_columns/layout_rows'
    ];

    var $APIs = array(
        "site_page"
    );


    function run()
    {
        parent::run();

        if ($this->usertype < USERTYPE_ADMIN) return array("status" => "error");

        switch ($_REQUEST["act"]) {
            case "get_data":
                $p = array(
                    "version_id" => $this->site_version["id"]
                );
                return $this->getResponse("ok",
                    array(
                        "page_rows_list" => $this->layout_rows->getPageRowsList($p)
                    )
                );
                break;

            case "add":
            case "clone":
            case "edit":
                $this->saveMenuData();
                $this->savePageData();
                $this->site_versions->setChanged($this->site_version["id"]);
                return $this->getResponse("ok");
                break;

            case "delete":
                $this->saveMenuData();

                $p = array();

                $page_ids = explode(";", $_REQUEST["page_ids"]);
                foreach ($page_ids as $id) {
                    $p["id"] = (int)$id;
                    $this->site_page->delete($p);
                }
                $this->site_versions->setChanged($this->site_version["id"]);
                return $this->getResponse("ok");
                break;

            case "save_menu_struct":
                $this->saveMenuData();
                return $this->getResponse("ok");
                break;


            /// page tpls

            case "get_page_templates":
                $this->useAPI("site_page_templates");
                return array(
                    "status" => "ok",
                    "data" => $this->site_page_templates->getList()
                );
                break;
        }
    }


    function saveMenuData()
    {
        if (get_magic_quotes_gpc()) {
            $_REQUEST["menu_data"] = stripslashes($_REQUEST["menu_data"]);
        }
        $menu_data = $this->json->decode(str_replace("\'", "'", $_REQUEST["menu_data"]));
        $p = array(
            "version_id" => $this->site_version["id"],
            "data_php" => $menu_data,
            "data_js" => $_REQUEST["menu_data"],
            "flags" => $_REQUEST["flags"]
        );
        $this->site_menu->set($p);
    }


    function savePageData()
    {
        global $config;
        if ($_REQUEST["type"] == "external") return;

        if (get_magic_quotes_gpc()) {
            $_REQUEST["page_data"] = stripslashes($_REQUEST["page_data"]);
        }

        $p = $this->json->decode(str_replace("\'", "'", $_REQUEST["page_data"]));
        if ($p["id"] == "") {
            $new_page = true;
            unset($p["id"]);
        } else {
            $new_page = false;
        }

        if ($this->usertype != USERTYPE_WEBSEMBLE_ADMIN) {
            $p["is_page_tpl"] = 0;
            $p["thumb"] = "";
        }


        $p["version_id"] = $this->site_version["id"];
        $p["id"] = $this->site_page->set($p);

        if (!$p["id"]) return false;


        $p2 = array(
            "page_id" => $p["id"],
            "version_id" => $this->site_version["id"]
        );

        $pages_rows_list = $this->layout_rows->getPageRowsList($p2);
        $page_rows = $pages_rows_list[$p["id"]] or array();


        // body row
        if ($p["type"] == "std") {
            if ($p["src_page_id"] > 0) {
                // clone body row
                $p3 = array(
                    "page_id" => $p["src_page_id"]
                );
                $src_rows = $this->layout_rows->getPageRows($p3, true);

                $cloned_row = $src_rows[1];
                unset($cloned_row["id"]);
                $cloned_row["page_id"] = $p["id"];
                $cloned_row["position"] = 1;
                $cloned_row["row_id"] = $this->layout_rows->setRow($cloned_row);
                $this->layout_rows->assignRowToPage($cloned_row);
            } else if ($new_page) {
                if ($p["page_tpl_id"]) {
                    $this->cloneBodyRowData($p);
                } else {
                    $p2["position"] = 1;
                    $this->layout_rows->createNewRow($p2);
                }
            }
        }

        // header row
        $p2["position"] = 0;
        if ($p["header_row_page_id"] == "new") {
            if ($src_rows[0]) {
                $cloned_row = $src_rows[0];
                unset($cloned_row["id"]);
                $cloned_row["position"] = 0;
                $cloned_row["page_id"] = $p["id"];
                $cloned_row["row_id"] = $this->layout_rows->setRow($cloned_row);
                $this->layout_rows->assignRowToPage($cloned_row);
            } else {
                $this->layout_rows->createNewRow($p2);
            }
        } else if ($p["header_row_page_id"] == "none") {
            if ($page_rows[0]) {
                $p2["page_id"] = $p["id"];
                $this->layout_rows->deleteRowByPosition($p2);
            }
        } else if ($p["header_row_page_id"] != $page_rows[0]) {
            if ($page_rows[0]) {
                $p2["page_id"] = $p["id"];
                $this->layout_rows->deleteRowByPosition($p2);
            }
            if ($p["header_row_page_id"] == $p["id"]) {
                $this->layout_rows->createNewRow($p2);
            } else {
                $p2["src_page_id"] = $p["header_row_page_id"];
                $this->layout_rows->assignRowFromAnotherPage($p2);
            }
        }


        // footer row
        $p2["position"] = 255;
        if ($p["footer_row_page_id"] == "new") {
            if ($src_rows[255]) {
                $cloned_row = $src_rows[255];
                unset($cloned_row["id"]);
                $cloned_row["position"] = 255;
                $cloned_row["page_id"] = $p["id"];
                $cloned_row["row_id"] = $this->layout_rows->setRow($cloned_row);
                $this->layout_rows->assignRowToPage($cloned_row);
            } else {
                $this->layout_rows->createNewRow($p2);
            }
        } else if ($p["footer_row_page_id"] == "none") {
            if ($page_rows[0]) {
                $p2["page_id"] = $p["id"];
                $this->layout_rows->deleteRowByPosition($p2);
            }
        } else if ($p["footer_row_page_id"] != $page_rows[255]) {
            if ($page_rows[255]) {
                $p2["page_id"] = $p["id"];
                $this->layout_rows->deleteRowByPosition($p2);
            }
            if ($p["footer_row_page_id"] == $p["id"]) {
                $this->layout_rows->createNewRow($p2);
            } else {
                $p2["src_page_id"] = $p["footer_row_page_id"];
                $this->layout_rows->assignRowFromAnotherPage($p2);
            }
        }

    }


    function getResponse($status, $data = null)
    {
        return array(
            "status" => $status,
            "data" => $data
        );
    }


    function cloneBodyRowData($page)
    {
        global $config;

        $src_page = $this->site_page->get($page["page_tpl_id"]);
        if (!$src_page["is_page_tpl"]) return false;

        $p = array(
            "page_id" => $src_page["id"]
        );
        $src_rows = $this->layout_rows->getPageRows($p, true);
        $src_row_id = $src_rows[1]["id"];
        $cloned_row = $src_rows[1];
        unset($cloned_row["id"]);

        $cloned_row["version_id"] = $this->site_version["id"];

//            $cloned_row["pc_style_id"] = 0;
        $cloned_row["pc_search_index_ready"] = 0;
        $cloned_row["pc_search_index"] = "";
//            $cloned_row["mobile_style_id"] = 0;
        $cloned_row["mobile_search_index_ready"] = 0;
        $cloned_row["mobile_search_index"] = "";

        $used_images = array();
        $tconv = array();


        // get texts ids
        $p = array(
            "row_id" => $src_row_id,
            "layout_mode" => "pc"
        );
        $pc_texts = $this->layout_rows->getRowTexts($p);
        $p["layout_mode"] = "mobile";
        $mobile_texts = $this->layout_rows->getRowTexts($p);


        $cloned_row["pc_used_texts"] = $pc_texts;
        $cloned_row["mobile_used_texts"] = $mobile_texts;

        // create new row
        $cloned_row["page_id"] = $page["id"];
        $cloned_row["position"] = 1;
        $cloned_row["row_id"] = $this->layout_rows->setRow($cloned_row);
        $this->layout_rows->assignRowToPage($cloned_row);

        /*
                    $p = array(
                        "version_id" => $this->site_version["id"]
                    );
                    $this->useAPI("site_styles");
                    $this->site_styles->setChanged($p);
        */
    }


    function addLocalImagesSrc(&$array, $str)
    {
        preg_match_all('~src=[\"\']([^\"\']+)~i', $str, $matches, PREG_SET_ORDER);
        foreach ($matches as $m) {
            if ($m[1][0] == "/") {
                $array[] = substr($m[1], strrpos($m[1], "/") + 1);
            }
        }
    }


}

?>