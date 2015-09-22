<?php


class api_forms
{

    function getList()
    {
        $sql = "
                SELECT
                    id, 
                    title
                FROM
                    forms
                ORDER BY
                    title";
        return $this->db->get_list($sql);
    }


    function getSubmitsCount()
    {
        $sql = "
                SELECT
                    form_id,
                    count(*) as count
                FROM
                    forms_data
                GROUP BY
                    form_id";

        return $this->db->get_key_list($sql, null, "form_id");
    }


    // $id: form id
    function get($id)
    {
        $sql = "
                SELECT
                    id,
                    title,
                    description,
                    confirmation,
                    fields,
                    list_field_name,
                    list_field_label
                FROM
                    forms
                WHERE
                    id = %id%";
        return $this->db->get_first($sql, $id);
    }


    // $args: array( "fields" =>, "title" =>)
    function create($args)
    {
        $sql = "
                INSERT INTO
                    forms
                (
                    title,
                    description,
                    confirmation,
                    fields,
                    list_field_name,
                    list_field_label
                ) VALUES (
                    %title%,
                    %description%,
                    %confirmation%,
                    %fields%,
                    %list_field_name%,
                    %list_field_label%
                )";
        $this->db->query($sql, $args);
        $id = $this->db->insert_id();
        return $id;
    }


    // $args: array("id" => form id,"title" =>, "fields" => )
    function update($args)
    {
        $sql = "
                UPDATE
                    forms
                SET
                    title = %title%,
                    description = %description%,
                    confirmation = %confirmation%,
                    fields = %fields%,
                    list_field_name = %list_field_name%,
                    list_field_label = %list_field_label%
                WHERE
                    id = %id%";
        return $this->db->query($sql, $args);
    }


    // $args: array("id" => form id)
    function delete($args)
    {
        global $config;

        $sql = "
                SELECT
                    ff.sys_name
                FROM
                    forms_files as ff
                WHERE
                    ff.form_id = %id%";
        $files = $this->db->get_list($sql, $args);
        for ($i = 0; $i < count($files); $i++) {
            @unlink($config["storage"] . "/" . $files[$i]["sys_name"]);
        }

        $sql = "
                DELETE FROM
                    forms_files
                WHERE
                    form_id = %id%";
        $this->db->query($sql, $args);

        $sql = "
                DELETE FROM
                    forms_data
                WHERE
                    form_id = %id%";
        $this->db->query($sql, $args);


        $sql = "
                DELETE FROM
                    forms
                WHERE
                    id = %id%";
        return $this->db->query($sql, $args);
    }




    // forms submits


    // $args: { form_id,  email, data, files }
    function saveData($args)
    {
        $sql = "
                INSERT INTO
                    forms_data
                    (form_id,  email, data, date)
                VALUES
                    (%form_id%, %email%, %data%, FROM_UNIXTIME(" . time() . "))";
        $this->db->query($sql, $args);
        return $this->db->insert_id();
    }


    // $form: form record
    function getDataList($form)
    {
        global $config;

        $sql = "
                SELECT
                    id,
                    list_field_name,
                    list_field_value,
                    data,
                    DATE_FORMAT(date, %df%) as date
                FROM
                    forms_data
                WHERE
                    form_id = %id%
                ORDER BY
                    date";
        $form["df"] = $config["formats"]["datetime_sql"];
        $rows = $this->db->get_list($sql, $form);

        if ($form["list_field_name"]) {
            $sql = "
                    UPDATE
                        forms_data
                    SET
                        list_field_name = %list_field_name%,
                        list_field_value = %list_field_value%
                    WHERE
                        id = %id%";
            $this->dialog->useAPI("json");
            for ($i = 0; $i < count($rows); $i++) {
                $row =& $rows[$i];
                if ($row["list_field_name"] != $form["list_field_name"]) {
                    $data = $this->dialog->json->decode($row["data"]);
                    $row["list_field_name"] = $form["list_field_name"];
                    $row["list_field_value"] = $data[$form["list_field_name"]] ? $data[$form["list_field_name"]]["value"] : "";
                    $this->db->query($sql, $row);
                    unset($row["list_field_name"]);
                    unset($row["data"]);
                }
            }
        }
        return $rows;
    }


    // $args: { id }
    function deleteDataRecord($args)
    {
        global $config;

        $sql = "
                SELECT
                    ff.sys_name,
                FROM
                    forms_files as ff
                WHERE
                    ff.forms_data_id = %id%";
        $files = $this->db->get_list($sql, $args);
        for ($i = 0; $i < count($files); $i++) {
            @unlink($config["storage"] . "/" . $files[$i]["sys_name"]);
        }

        $sql = "
                DELETE FROM
                    forms_files
                WHERE
                    forms_data_id = %id%";
        $this->db->query($sql, $args);

        $sql = "
                DELETE FROM
                    forms_data
                WHERE
                    id = %id%";
        $this->db->query($sql, $args);
    }


    // $args: { id }
    function getDataRecord($args)
    {
        $sql = "
                SELECT
                    *
                FROM
                    forms_data
                WHERE
                    id = %id%";
        $res = array(
            "data" => $this->db->get_first($sql, $args)
        );

        $sql = "
                SELECT
                    ff.id,
                    ff.name,
                    ff.sys_name
                FROM
                    forms_files as ff
                WHERE
                    ff.forms_data_id = %id%";
        $res["files"] = $this->db->get_list($sql, $args);
        return $res;
    }


    function formatData($data)
    {
        $this->dialog->useAPI("json");
        $data = $this->dialog->json->decode($data);
        return $this->getHTML($data);
    }


    function getHTML($saved_form_data)
    {
        $html = "";
        foreach ($saved_form_data as $tmp => $p) {
            $html .= "<div><label>" . $p["label"] . ": </label>" . $p["value"] . "</div>";
        }
        return $html;
    }


    // $args: { form_id,  forms_data_id,  files: [{ name: "", sys_name: ""}, ...] }
    function saveFiles($args)
    {
        $sql = "
                INSERT INTO
                    forms_files
                    (form_id, forms_data_id, name, sys_name)
                VALUES
                    (%form_id%, %forms_data_id%, %name%, %sys_name%)";
        $p = array(
            "form_id" => $args["form_id"],
            "forms_data_id" => $args["forms_data_id"]
        );

        for ($i = 0; $i < count($args["files"]); $i++) {
            $p["name"] = $args["files"][$i]["name"];
            $p["sys_name"] = $args["files"][$i]["sys_name"];
            $this->db->query($sql, $p);
        }
    }


    // $args: { id }
    function getFile($args)
    {
        $sql = "
                SELECT
                    *
                FROM
                    forms_files
                WHERE
                    id = %id%";
        return $this->db->get_first($sql, $args);
    }


    function sendDataByEmail($email, $html, $files, $subject = "Form data", $custom_from_field = false)
    {
        global $config;
        $this->dialog->useApi('site_mailer');
        $email_from = "donotreply@" . $config["domain"];
        if ($custom_from_field) {
            $email_from = $custom_from_field;
        }

        $this->dialog->site_mailer->setSubjectForce($subject);
        $this->dialog->site_mailer->setBodyForce($html);
        return $this->dialog->site_mailer->sendWithAttachment($email_from, $email, $files);
    }

}