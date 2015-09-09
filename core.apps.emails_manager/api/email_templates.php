<?

class api_email_templates
{


    function getInfosList($key = '')
    {
        $d = array();
        $sql = "
                SELECT
                    *
                FROM
                    email_infos";
        if ($key != '') {
            $sql .= " where `key` like %key%";
            $d["key"] = $key;
        }
        return $this->db->get_list($sql, $d);
    }


    // data: {  key }
    function &get($data)
    {
        $sql = "
                SELECT
                    et.subject,
                    et.body,
					ei.placeholders,
					ei.key
                FROM
                    email_templates as et
                LEFT JOIN
                    email_infos as ei
                ON
                    et.email_info_id = ei.id
                WHERE
                    ei.key like %key%";
        $res = $this->db->get_first($sql, $data);
        if (!$res) {
            $res = $this->db->get_first($sql, $data);
        }
        return $res;
    }

    // data: {  email_info_id, subject, body } - insert
    function set(&$data)
    {
        $sql = "
                SELECT
                    id
                FROM
                    email_templates
                WHERE
                    email_info_id = %email_info_id%";
        $id = $this->db->get_one($sql, $data);

        if ($id == null) {
            $sql = "
                    INSERT INTO
                        email_templates
                        (email_info_id, subject, body)
                    VALUES
                        (%email_info_id%, %subject%, %body%)";
        } else {
            $data["id"] = $id;
            $sql = "
                    UPDATE
                        email_templates
                    SET
                        subject = %subject%, 
                        body = %body%
                    WHERE
                        id = %id%";
        }
        $this->db->query($sql, $data);
    }


}

?>