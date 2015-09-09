<?php


class dialog_controller_emails_manager extends dialog_controller
{

    public $appAPIs = [
      'emails_manager/email_templates'
    ];

    var $APIs = array(
        "site_users"
    );


    function run()
    {
        parent::run();

        if ($this->usertype < USERTYPE_ADMIN) return null;

        switch ($_REQUEST["act"]) {

            case "get_infos":
                return array(
                    "status" => "ok",
                    "data" => $this->email_templates->getInfosList()
                );
                break;


            case "get_template":
                $p = array(
                    "key" => $_REQUEST["key"]
                );
                $data = $this->email_templates->get($p);
                return array(
                    "status" => "ok",
                    "key" => $_REQUEST["key"],
                    "data" => $data,
                    "emails" => $this->email_templates->getInfosList($_REQUEST["key"])
                );
                break;

            case "set_template":
                $p = array(
                    "email_info_id" => (int)$_REQUEST["email_info_id"],
                    "subject" => $_REQUEST["subject"],
                    "body" => $_REQUEST["body"]
                );
                $this->email_templates->set($p);


                return array(
                    "status" => "ok"
                );
                break;
        }
    }


}
