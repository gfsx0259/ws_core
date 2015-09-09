<?php
//TODO Separate Api also
class dialog_controller_layout_columns extends dialog_controller
{

    public $appAPIs = [
        'texts_manager/site_texts',
        'styles_manager/site_styles',
        'layout_columns/layout_modes',
        'layout_columns/layout_rows'
    ];

    public $APIs = [
        "site_page",
        "json",
        "sites"
    ];


    function run()
    {
        parent::run();
        if ($this->usertype < USERTYPE_ADMIN) return array("status" => "error");

        $this->layout_mode = $_REQUEST["layout_mode"] == "mobile" ? "mobile" : "pc";
        $status = 'updated';


        switch ($_REQUEST["act"]) {
            case "save_layout":
                // set rows data
                if (get_magic_quotes_gpc()) {
                    $_REQUEST["rows_data"] = stripslashes($_REQUEST["rows_data"]);
                    $_REQUEST["contact_us_emails"] = stripslashes($_REQUEST["rows_data"]);
                }
                $rows_data = unserialize($_REQUEST["rows_data"]);
                for ($i = 0; $i < count($rows_data); $i++) {
                    $rows_data[$i]["used_texts"] = $this->stringToVector($rows_data[$i]["used_texts"]);
                    $used_styles = $this->stringToVector($rows_data[$i]["used_styles"]);
                    $rows_data[$i]["used_styles"] = implode(";", $used_styles);
                    $rows_data[$i]["layout_mode"] = $this->layout_mode;
                    $rows_data[$i]["version_id"] = $this->site_version["id"];
                    $this->layout_rows->setRow($rows_data[$i]);
                }

                //necessary to protect the code as a widget can not be installed
                try{
                    $this->useAppAPI("contact_us/contact_us_emails");
                    $contact_us_emails = $this->json->decode($_REQUEST["contact_us_emails"]);

                    $p = array();
                    foreach ($contact_us_emails as $widget_id => $email) {
                        $p["widget_id"] = $widget_id;
                        $p["email"] = $email;
                        $this->contact_us_emails->set($p);
                    }
                }catch (Exception $e){

                }

                break;

            case "set_row_style":
                $p = array(
                    "id" => $_REQUEST["row_id"],
                    "style_id" => $_REQUEST["style_id"],
                    "layout_mode" => $this->layout_mode
                );
                $this->layout_rows->setStyle($p);
                break;

            case "set_page_style":
                $p = array(
                    "id" => $_REQUEST["page_id"],
                    "style_id" => $_REQUEST["style_id"],
                    "layout_mode" => $this->layout_mode
                );
                $this->site_page->setStyle($p);
                break;

            case "set":
                $status = 'ok';
                $mode = $_REQUEST["mode"] == "mobile" ? "mobile" : "pc";
                $_SESSION["user"]["in_build"]["layout_mode"] = $mode;
                break;

            case "clear_mobile_data":
                $status = 'ok';
                $p = array(
                    "version_id" => $this->site_version["id"]
                );
                $this->layout_modes->clearMobileData($p);
                break;
        }

        $this->sites->setLastEdited();
//            if($this->site_version["is_changed"] == 0) {
        $this->site_versions->setChanged($this->site_version["id"]);
//            }


        return array("status" => $status);
    }


    function stringToVector($str)
    {
        $res = array();
        $ids = explode(";", $str);
        foreach ($ids as $id) {
            $id = (int)$id;
            if ($id) {
                $res[] = $id;
            }
        }
        return $res;
    }


}

?>