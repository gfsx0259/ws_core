<?


class dialog_controller_forms_manager extends dialog_controller
{

    public $widgetName = 'forms_manager';
    public $appAPIs = [
        'forms_manager/forms'
    ];

    var $APIs = array(
        "mailer",
        "captcha"
    );


    function run()
    {
        parent::run();


        switch ($_REQUEST["act"]) {
            case "get_list":
                if ($this->usertype < USERTYPE_ADMIN) return null;
                $res = $this->getFormsList();
                if ($_REQUEST["default_forms"] == 1) {
                    $res["default_forms_list"] = $this->forms->getList(1);
                }
                if ($_REQUEST["submits_count"] == 1) {
                    $res["submits_count"] = $this->forms->getSubmitsCount($this->site_owner["id"]);
                }
                return $res;
                break;


            case "get":
                $form = $this->forms->get($_REQUEST["id"]);
                if (!$form) die();

                $res = array(
                    "status" => "ok",
                    "form_id" => $form["id"],
                    "form" => array(
                        "title" => $form["title"],
                        "description" => $form["description"],
                        "confirmation" => $form["confirmation"],
                        "list_field_name" => $form["list_field_name"],
                        "list_field_label" => $form["list_field_label"],
                        "fields" => $this->json->decode($form["fields"])
                    )
                );
                die($this->json->encode($res));
                break;


            case "set":
                if ($this->usertype < USERTYPE_ADMIN) return null;
                $p = array(
                    "id" => $_REQUEST["id"],
                    "title" => $_REQUEST["title"],
                    "description" => $_REQUEST["description"],
                    "confirmation" => $_REQUEST["confirmation"],
                    "fields" => urldecode($_REQUEST["fields"]),
                    "list_field_name" => $_REQUEST["list_field_name"],
                    "list_field_label" => $_REQUEST["list_field_label"]
                );

                $res = array();
                if ($p["id"] == "") {
                    $res["form_id"] = $this->forms->create($p);
                } else {
                    $this->forms->update($p);
                    $res["form_id"] = $p["id"];
                }
                $res["list"] = $this->forms->getList($this->site_owner["id"]);
                return $res;
                break;


            case "delete":
                if ($this->usertype < USERTYPE_ADMIN) return null;
                $p = array(
                    "id" => $_REQUEST["id"]
                );
                $this->forms->delete($p);
                return $this->getFormsList();
                break;

            case "send_email":
                if ($this->usertype < USERTYPE_ADMIN) return null;
                return $this->sendEmail();
                break;


            case "get_form_data_list":
                if ($this->usertype < USERTYPE_ADMIN) return null;
                if (isset($_GET["delete_data_id"])) {
                    $p = array(
                        "id" => $_GET["delete_data_id"]
                    );
                    $this->forms->deleteDataRecord($p);
                }

                $form = $this->forms->get($_GET["form_id"]);
                return array(
                    "status" => "ok",
                    "list_field_label" => $form["list_field_label"],
                    "list" => $this->forms->getDataList($form)
                );
                break;


            case "get_form_data":
                if ($this->usertype < USERTYPE_ADMIN) return null;
                $p = array(
                    "id" => $_GET["id"]
                );
                $res = $this->forms->getDataRecord($p);
                $res["data"]["data"] = $this->forms->formatData($res["data"]["data"]);
                $res["status"] = "ok";
                return $res;
                break;


            case "send_form_data":
                if ($this->usertype < USERTYPE_ADMIN) return null;
                $p = array(
                    "id" => $_GET["id"]
                );
                $res = $this->forms->getDataRecord($p);
                $html = $this->forms->formatData($res["data"]["data"]);
                $form = $this->forms->get($res["data"]["form_id"]);
                $this->forms->sendDataByEmail($_GET["email"], $html, $res["files"], $form["title"]);
                break;


            case "captcha":
                $form_id = $_REQUEST["form_id"];
                $code = $this->captcha->generateCode();
                if (!is_array($_SESSION["fccodes"])) {
                    $_SESSION["fccodes"] = array();
                }
                $_SESSION["fccodes"][$form_id] = $code;
                $this->captcha->render($code);
                break;
        }
    }


    function &getFormsList()
    {
        return array(
            "status" => "ok",
            "list" => $this->forms->getList($this->site_owner["id"])
        );
    }


    function sendEmail()
    {
        global $config;

        $email = $_REQUEST["email"];
        if ($email == "") return false;
        $data = unserialize(stripslashes($_REQUEST["data"]));

        $msg = array();
        foreach ($data as $k => $v) {
            $msg[] = $k . ": " . $v;
        }

        $this->mailer->sendManually(
            "donotreply@" . $config["domain"],
            $email,
            "Site form request",
            nl2br(implode("\n", $msg)),
            "Site form"
        );
        return true;
    }


}

?>