<?

class api_site_users
{


    var $data_fields = array(
        "confirmed",
        "contributor",
        "approved",
        "pwd",
        "email",
        "reg_reason",
        "first_name",
        "last_name",
        "address",
        "address2",
        "postcode",
        "state_id",
        "country_id",
        "suburb",
        "phone",
        "mobile",
        "custom_state",
        "website",
        "company_name",
        "company_code",
        "ecom_discount_value",
        "ecom_discount_mode",
        "ecom_terms",
        "delivery_info",
        "notes"
    );


    var $search_fields = array(
        "id",
        "ext_id",
        "email",
        "pwd",
        "first_name",
        "last_name"
    );


    // $args: int
    // or
    // $args: { id: int}
    function get($args, $full_info = false)
    {
        if (is_numeric($args)) {
            $where_sql = "su.id = %id%";
        } else {
            if (is_numeric($args["email"])) {
                $args["ext_id"] = (int)$args["email"];
                if (!$args["ext_id"]) return false;
                unset($args["email"]);
            }

            $where_sql = array();
            foreach ($this->search_fields as $f) {
                if (isset($args[$f])) {
                    $where_sql[] = "su.$f = %$f%";
                }
            }
            if (count($where_sql) == 0) return false;
            $where_sql = implode(" AND ", $where_sql);
        }

        if ($full_info) {
            $sql = "
                    SELECT
                        su.*,
                        c.printable_name as country,
                        s.name as state,
                        s.abbrev as state_abbrev
                    FROM
                        site_users as su
                    LEFT JOIN
                        countries as c
                    ON
                        c.id = su.country_id
                    LEFT JOIN
                        country_states as s
                    ON
                        s.id = su.state_id
                    WHERE
                        " . $where_sql . "
                    LIMIT 1";
            return $this->db->get_first($sql, $args);
        } else {
            $sql = "
                    SELECT
                        *
                    FROM
                        site_users as su
                    WHERE
                        " . $where_sql . "
                    LIMIT 1";
            return $this->db->get_first($sql, $args);
        }
    }


    function getByPointFields($args)
    {
        $where = array();
        foreach ($args as $key => $val) {
            $where[] = $key . ' = ' . '%' . $key . '%';
        }
        $sql = "
                    SELECT
                        *
                    FROM
                        site_users as su
                    WHERE
                        " . implode($where, ' and ') . "
                    LIMIT 1";

        return $this->db->get_first($sql, $args);
    }


    function getLogged()
    {
        return $_SESSION["site_user"];
    }


    function getAll()
    {
        $sql = "
                SELECT
                    *
                FROM
                    site_users";
        return $this->db->get_list($sql);
    }


    function getByEmail($email)
    {
        $sql = "
                SELECT
                    *
                FROM
                    site_users
                WHERE
                    email = %email%";
        return $this->db->get_first($sql, $email);
    }


    function create($data)
    {
        if ($this->isEmailUsed($data)) {
            return null;
        }

        $sql1 = "";
        $sql2 = "";
        foreach ($this->data_fields as $field) {
            $sql1 .= "\n," . $field;
            $sql2 .= "\n,%" . $field . "%";
        }

        $sql = "
                INSERT INTO
                    site_users
                    (
                    ext_id
                    " . $sql1 . ")
                VALUES
                    (
                    %ext_id%
                    " . $sql2 . "
                    )";
        $this->db->query($sql, $data);
        $id = $this->db->insert_id();
        return $id;
    }


    // data: { id: int, | ext_id: int .... other fields }
    function update($data)
    {
        $where_sql = array();
        if (isset($data["id"])) {
            $where_sql[] = "id = %id%";
        }
        if (isset($data["ext_id"])) {
            $where_sql[] = "ext_id = %ext_id%";
        }

        if (count($where_sql) == 0) return false;


        $sql1 = array();
        foreach ($this->data_fields as $field) {
            if ($field == "pwd" && $data["pwd"] == "") continue;
            $sql1[] = $field . "=%" . $field . "%";
        }

        $sql = "
                UPDATE
                    site_users
                SET " . implode(",", $sql1) . "
                WHERE
                    " . implode(" AND ", $where_sql) . "
                LIMIT 1";
        $this->db->query($sql, $data);
        return true;
    }


    // data: { id: int, ext_id: int }
    function setExtId($args)
    {
        $sql = "
                UPDATE
                    site_users
                SET 
                    ext_id = %ext_id%
                WHERE
                    id = %id%";
        $this->db->query($sql, $args);
    }


    function isEmailUsed($data)
    {
        $sql = "
                SELECT 
                    id
                FROM 
                    site_users 
                WHERE
                    email = %email%";
        $res = $this->db->get_first($sql, $data);
        return isset($res["id"]);
    }


    function register($data)
    {
        global $host;

        $sql = "
                SELECT 
                    *
                FROM
                    site_users
                WHERE 
                    email = %email%";

        if ($this->db->get_first($sql, $data)) {
            return array("status" => "email_used");
        }

        return array(
            "status" => "success",
            "id" => $this->create($data)
        );
    }


    function sendActivatedEmail($id, $from_email)
    {
        global $host;

        $user = $this->get($id);
        if (!$user) return;

        $v = array(
            "PWD" => $user["pwd"]
        );
        $this->dialog->site_mailer->setValues($v);
        $this->dialog->site_mailer->setTemplate("new_user_activated");
        $this->dialog->site_mailer->send($from_email, $user["email"]);
    }


    function sendRegConfirmationEmail($id, $from_email, $url = false)
    {
        global $host;

        $user = $this->get($id);
        if (!$user) return;

        if (!$url) {
            $url = "http://" . $host . "/user/?mode=reg_confirm";
        } else {
            $url .= "?page_action=user_reg_confirm";
        }

        $ev = array(
            "NAME" => $user["first_name"] . " " . $user["last_name"],
            "CONFIRMATION_URL" =>
                $url .
                "&id=" . $user["id"] .
                "&code=" . $this->getConfirmCode($user["email"])
        );
        $this->dialog->site_mailer->setValues($ev);
        $this->dialog->site_mailer->setTemplate("new_user_confirm");
        $this->dialog->site_mailer->send($from_email, $user["email"]);
    }


    function getConfirmCode($v)
    {
        if (empty($v)) return false;
        $s = "u680oe" . $v;
        $s = md5($s);
        return $s[0] . $s[7] . $s[15] . $s[23] . $s[31];
    }


    function confirm($id, $code)
    {
        $data = $this->get($id);
        if ($data["email"] != "") {
            if ($data["confirmed"] == 1) return false;
            $sql2 = "confirmed = 1";
        }

        if ($this->getConfirmCode($data["email"]) == $code) {
            $sql = "
                    UPDATE
                        site_users
                    SET
                        " . $sql2 . "
                    WHERE
                        id = %id%";
            $this->db->query($sql, $id);
            $data["confirmed"] = 1;
            return $data;
        }
    }


    function resetPwd($id, $code)
    {
        $data = $this->get($id);

        if (($data["confirmed"] == 1) && ($this->getConfirmCode($data["email"] . $data["pwd"]) == $code)) {
            $s = "1891" . time();
            $s = md5($s);
            $new_pwd = $s[0] . $s[7] . $s[10] . $s[22] . $s[30];

            $sql = "
                    UPDATE
                        site_users
                    SET
                        pwd = '" . $new_pwd . "'
                    WHERE
                        id = %id%
                    LIMIT 1";
            $this->db->query($sql, $id);
            $data["pwd"] = $new_pwd;
            return $data;
        }
        return false;
    }


    // $args: { email: str}
    function sendPwd($args)
    {
        if (is_numeric($args["email"])) {
            $ext_id = (int)$args["email"];
            if (!$ext_id) return false;

            $sql = "ext_id = %email%";
        } else {
            $sql = "email = %email%";
        }

        $sql = "
                SELECT
                    id,
                    email,
                    first_name,
                    last_name,
                    pwd
                FROM
                    site_users
                WHERE
                    " . $sql;
        $user = $this->db->get_first($sql, $args);
        if (!$user) {
            return false;
        }


        $this->dialog->useAPI("site_mailer");
        $ev = array(
            "SITE_NAME" => $this->dialog->site_info["title"],
            "CUSTOMER_NAME" => $user["first_name"] . " " . $user["last_name"],
            "PWD" => $user["pwd"]
        );
        $this->dialog->site_mailer->setValues($ev);
        $this->dialog->site_mailer->setTemplate("checkout_send_pwd");
        $this->dialog->site_mailer->send($this->dialog->site_owner["email"], $user["email"]);
        return true;
    }


    function login($data)
    {
        $sql = "
                SELECT
                    id, first_name, last_name, email, contributor
                FROM
                    site_users
                WHERE
                    pwd = %pwd% AND
                    confirmed = 1 AND
                    approved = 1 AND 
                    email = %email%";

        $data = $this->db->get_first($sql, $data);
        unset($_SESSION["site_user"]);
        if ($data) {
            $_SESSION["site_user"] = $data;
        }
        return $data;
    }


    function logout()
    {
        unset($_SESSION["site_user"]);
        return true;
    }


}

?>