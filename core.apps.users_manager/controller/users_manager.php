<?

class dialog_controller_users_manager extends dialog_controller
{

    public $appAPIs = [
        'users_manager/site_users',
        'users_manager/site_users_admin'
    ];

    var $APIs = array(
        "contributors",
        "site_mailer",
        "json",
        "captcha",
        "mailer"
    );


    function run()
    {
        parent::run();

        global $config;
        global $host;

        $res = null;

        switch ($_REQUEST["act"]) {

            // login/reg etc

            case "login":
                if (trim($_REQUEST["email"]) == "" || trim($_REQUEST["pwd"]) == "") return "error";
                return $this->site_users->login($_REQUEST) ? "success" : "error";
                break;

            case "logout":
                return $this->site_users->logout();
                break;


            case "reg_captcha":
                $_SESSION["rucode"] = $this->captcha->generateCode();
                $this->captcha->render($_SESSION["rucode"]);
                break;


            case "register":
                $site_info = $this->sites->getSiteInfo();

                $pwd = trim($_REQUEST["pwd"]);
                $first_name = trim($_REQUEST["first_name"]);
                $last_name = trim($_REQUEST["last_name"]);
                $email = trim($_REQUEST["email"]);
                $reg_reason = nl2br(trim($_REQUEST["reg_reason"]));
                $captcha_code = $_REQUEST["captcha_code"];


                if ($pwd == "" || $email == "") {
                    return "error";
                }

                if (($site_info["users_reg_msg"] != "") && ($reg_reason == "")) {
                    return array("status" => "empty_reason");
                }

                if ($captcha_code != $_SESSION["rucode"]) {
//                        return array("status" => "captcha_error");
                }

                $p = array(
                    "pwd" => $pwd,
                    "reg_reason" => $reg_reason,
                    "email" => $email,
                    "first_name" => $first_name,
                    "last_name" => $last_name,
                    "confirmed" => $site_info["users_reg_confirmation"] == 1 ? 0 : 1,
                    "approved" => $site_info["users_reg_moderation"] == 1 ? 0 : 1,
                );
                $res = $this->site_users->register($p);

                if ($res["status"] != "success") {
                    return array("status" => $res["status"]);
                }
                unset($_SESSION["rucode"]);

                $site_owner = $this->users->getContactInfo();
                $ev = array(
                    "SITE_OWNER" => $site_owner["fname"] . " " . $site_owner["lname"],
                    "SITE_NAME" => $site_info["title"],
                    "USER_NAME" => $name,
                    "USER_EMAIL" => $email,
                    "USER_PWD" => $pwd,
                    "USER_REG_REASON" => empty($reg_reason) ? "n/a" : $reg_reason
                );
                $this->mailer->setValues($ev);
                $this->mailer->setTemplate("user_signup");
                $this->mailer->send("donotreply@" . $config["domain"], $site_owner["email"]);


                if ($site_info["users_reg_moderation"] == 1) {
                    $res["msg"] = "waiting_approval";
                } else if ($site_info["users_reg_confirmation"] == 1) {
                    if (isset($_REQUEST["confirm_page_url"])) {
                        $url = explode("?", $_REQUEST["confirm_page_url"]);
                        $url = $url[0];
                    }
                    $this->site_users->sendRegConfirmationEmail($res["id"], $site_owner["email"], $url);
                    $res["msg"] = "confirmation_email_sent";
                } else {
                    $this->site_users->login($p);
                    $this->site_users->sendActivatedEmail($res["id"], $site_owner["email"]);
                    $res["msg"] = "registered";
                }
                return $res;
                break;


            case "reset_pwd":
                $site_info = $this->sites->getSiteInfo();
//                    if($site_info["enable_users"] != "1") return "error";

                $email = trim($_REQUEST["email"]);
                if ($email != "") {
                    $p = array(
                        "email" => $email
                    );
                    $user = $this->site_users->getByEmail($p);

                    if ($user) {
                        if (isset($_REQUEST["reset_page_url"])) {
                            $url = explode("?", $_REQUEST["reset_page_url"]);
                            $url = $url[0] . "?page_action=user_reg_reset_pwd";
                        } else {
                            $url = "http://" . $host . "/user/?mode=reset_pwd";
                        }

                        $ev = array(
                            "NAME" => $user["first_name"] . " " . $user["last_name"],
                            "RESET_URL" =>
                                $url .
                                "&id=" . $user["id"] .
                                "&code=" . $this->site_users->getConfirmCode($user["email"] . $user["pwd"])
                        );
                        $this->site_mailer->setValues($ev);
                        $this->site_mailer->setTemplate("user_reset_pwd");

                        $site_owner = $this->users->getContactInfo();
                        $this->site_mailer->send($site_owner["email"], $email);
                    }
                    return "ok";
                }
                break;




            // users manager

            // settings
            case "save_settings":
                if ($this->usertype < USERTYPE_ADMIN) return false;

                $p = array(
                    "enable_users" => (int)$_REQUEST["enable_users"],
                    "users_reg_moderation" => (int)$_REQUEST["users_reg_moderation"],
                    "users_reg_confirmation" => (int)$_REQUEST["users_reg_confirmation"],
                    "users_reg_msg" => nl2br($_REQUEST["users_reg_msg"])
                );
                $this->sites->setValues($p);


                $data = array();
                if (!$p["users_reg_confirmation"]) {
                    $data["confirmed"] = 1;
                }
                if (!$p["users_reg_moderation"]) {
                    $data["approved"] = 1;
                }
                if (count($data)) {
                    $this->site_users_admin->massUpdate($data);
                }
                return "ok";
                break;


            // contributor permissions

            case "get_permissions":
                if ($this->usertype < USERTYPE_ADMIN) return false;

                return $this->contributors->getPermissions();
                break;


            case "set_permissions":
                if ($this->usertype < USERTYPE_ADMIN) return false;
                $d = $_POST;
                $this->contributors->setPermissions($d);
                return "ok";
                break;


            // users

            case "search_users":
                if ($this->usertype < USERTYPE_ADMIN) return array("status" => "error");
                return $this->searchUsers();
                break;


            case "delete_user":
                if ($this->usertype < USERTYPE_ADMIN) return array("status" => "error");
                $d = array(
                    "id" => $_REQUEST["id"]
                );
                $this->site_users_admin->delete($d);
                return "ok";
                break;


            case "update_user":
                if ($this->usertype < USERTYPE_ADMIN) return array("status" => "error");
                $d = $_POST;
                $this->site_users->update($d);
                return "ok";
                break;


            case "create_user":
                if ($this->usertype < USERTYPE_ADMIN) return array("status" => "error");
                $d = $_POST;
                $id = $this->site_users->create($d);
                if ($id == null) {
                    return array(
                        "status" => "email_used",
                        "id" => $id
                    );
                } else {
                    return array(
                        "status" => "ok",
                        "id" => $id
                    );
                }
                break;


            // moderation
            case "get_moderation_list":
                if ($this->usertype < USERTYPE_ADMIN) return array("status" => "error");

                $p = array(
                    "offset" => empty($_REQUEST["offset"]) ? 0 : (int)$_REQUEST["offset"],
                    "per_page" => empty($_REQUEST["per_page"]) ? 20 : (int)$_REQUEST["per_page"]
                );

                $res = $this->site_users_admin->getNotApproved($p);
                $res["status"] = "data";
                return $res;
                break;


            case "moderate":
                if ($this->usertype < USERTYPE_ADMIN) return array("status" => "error");


                if ($_REQUEST["approved"] != "") {
                    $p = array(
                        "id" => explode("-", $_REQUEST["approved"])
                    );
                    $this->site_users_admin->approve($p);

                    $site_info = $this->sites->getSiteInfo();

                    $cb = $site_info["users_reg_confirmation"] == 0 ? "sendActivatedEmail" : "sendRegConfirmationEmail";

                    $site_owner = $this->users->getContactInfo();

                    for ($i = 0; $i < count($p["id"]); $i++) {
                        $this->site_users->{$cb}($p["id"][$i], $site_owner["email"]);
                    }
                }

                if ($_REQUEST["disapproved"] != "") {
                    $p = array(
                        "id" => explode("-", $_REQUEST["disapproved"])
                    );
                    $this->site_users_admin->delete($p);
                }


                $p = array(
                    "offset" => 0,
                    "per_page" => empty($_REQUEST["per_page"]) ? 20 : (int)$_REQUEST["per_page"]
                );

                $res = $this->site_users_admin->getNotApproved($p);
                $res["status"] = "data";
                return $res;
                break;

        }
        return $res;
    }


    function &searchUsers()
    {
        $p = array(
            "offset" => empty($_REQUEST["offset"]) ? 0 : (int)$_REQUEST["offset"],
            "per_page" => empty($_REQUEST["per_page"]) ? 20 : (int)$_REQUEST["per_page"]
        );
        $q = empty($_REQUEST["q"]) ? "" : trim($_REQUEST["q"]);
        if (strlen($q) > 3) {
            $p["q"] = $q;
        }
        /*
        if($_REQUEST["confirmed"] != "") {
            $p["confirmed"] = $_REQUEST["confirmed"];
        }
        if($_REQUEST["contributor"] != "") {
            $p["contributor"] = $_REQUEST["contributor"];
        }
        */

        $res = $this->site_users_admin->search($p);
        $res["status"] = "users";
        return $res;
    }


}

?>