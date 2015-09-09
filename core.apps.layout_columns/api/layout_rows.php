<?

/*
    position values:
        0 - top row
        1..254 - inner rows
        255 - bottom row
*/


class api_layout_rows
{

    var $data_fields = array(
        "data",
        "style_id",
        "used_apps",
//            "used_texts",
        "used_submenus",
        "used_images",
        "used_styles",
        "search_index_ready",
        "search_index"
    );


    // $args: { page_id,  version_id, position, ... }
    function createNewRow($args)
    {
        $args["used_apps"] = "";
        $args["used_submenus"] = "";
        $args["used_images"] = "";
        $args["used_styles"] = "";
        $args["data"] = "{\"layout\":[{\"type\":\"container\",\"childs\":[{\"type\":\"cell\",\"width\":100,\"childs\":[]}]}],\"profiles\":{},\"style\":\"\",\"title\":\"\"}";
        $args["layout_mode"] = "pc";
        $args["row_id"] = $this->setRow($args);
        $args["owner"] = 1;

        $this->assignRowToPage($args);
    }


    // $args: {  page_id: int, layout_mode: "pc" | "mobile" | null}
    function getPageRows($args, $key_list_by_position = false)
    {
        $sql = "
                SELECT
                    lr.*,
                    lr2p.position,
                    lr2p.owner,
                    lr2p.page_id
                FROM
                    layout_rows2pages as lr2p
                JOIN
                    layout_rows as lr
                ON
                    lr2p.row_id = lr.id
                WHERE
                    lr2p.page_id = %page_id%
                ORDER BY
                    lr2p.position";
        if ($key_list_by_position) {
            $rows = $this->db->get_key_list($sql, $args, "position");
        } else {
            $rows = $this->db->get_list($sql, $args);
        }


        if ($args["layout_mode"]) {
            $res = array();
            foreach ($rows as $k => $row) {
                $res[$k] = array(
                    "id" => $row["id"],
                    "position" => $row["position"],
                    "owner" => $row["owner"],
                    "page_id" => $row["page_id"]
                );

                $layout_mode = $args["layout_mode"];
                if ($layout_mode == "mobile" && empty($row["mobile_data"])) {
                    $layout_mode = "pc";
                }

                foreach ($this->data_fields as $field) {
                    $res[$k][$field] = $row[$layout_mode . "_" . $field];
                }

                $p = array(
                    "row_id" => $row["id"],
                    "layout_mode" => $layout_mode
                );
                $res[$k]["used_texts"] = $this->getRowTexts($p);
            }
            return $res;
        }
        return $rows;
    }


    // $args: {  page_id, row_id, position, owner }
    function assignRowToPage($args)
    {
        $sql = "
                INSERT INTO
                    layout_rows2pages
                    (version_id, page_id, row_id, position, owner)
                VALUES
                    (%version_id%, %page_id%, %row_id%, %position%, %owner%)";
        $this->db->query($sql, $args);
    }


    // $args: {  src_page_id, page_id, position }
    function assignRowFromAnotherPage($args)
    {
        $sql = "
                SELECT
                    row_id
                FROM
                    layout_rows2pages
                WHERE
                    page_id = %src_page_id% AND
                    position = %position% AND
                    version_id = %version_id% AND
                    owner = 1";
        $args["row_id"] = $this->db->get_one($sql, $args);
        if ($args["row_id"]) {
            $sql = "
                    INSERT INTO
                        layout_rows2pages
                        (version_id, page_id, row_id, position, owner)
                    VALUES
                        (%version_id%, %page_id%, %row_id%, %position%, 0)";
            $this->db->query($sql, $args);
        }
    }


    // $args: {  page_id, position }
    function deleteRowByPosition($args)
    {
        $sql = "
                SELECT
                    *
                FROM
                    layout_rows2pages
                WHERE
                    page_id = %page_id% AND
                    position = %position%";
        $res = $this->db->get_first($sql, $args);
        $args["row_id"] = $res["row_id"];

        if (!$args["row_id"]) return;

        if ($res["owner"] == 1) {
            // unassign row from all pages
            $sql = "
                    DELETE FROM
                        layout_rows2pages
                    WHERE
                        row_id = %row_id%";
            $this->db->query($sql, $args);


            // delete row data
            $sql = "
                    DELETE FROM
                        layout_rows
                    WHERE
                        id = %row_id%";
            $this->db->query($sql, $args);


            // delete rows2texts
            $this->deleteRowText($args);
        } else {
            // unassign row from one page
            $sql = "
                    DELETE FROM
                        layout_rows2pages
                    WHERE
                        page_id = %page_id% AND
                        row_id = %row_id%";
            $this->db->query($sql, $args);
        }
    }




    // $args: { id, position, layout_mode:, data, style_id, used_apps, used_texts, used_submenus, used_images, used_styles}
    //
    function setRow($args)
    {
        $rp = array(
            "row_id" => $args["id"],
            "layout_mode" => $args["layout_mode"],
            "version_id" => $args["version_id"]
        );

        if ($args["id"]) {
            $fields = array();
            if ($args["layout_mode"]) {
                $args["search_index_ready"] = 0;
                foreach ($this->data_fields as $field) {
                    $fields[] = $args["layout_mode"] . "_" . $field . " = %" . $field . "%";
                }


                $rp["text_ids"] = $args["used_texts"];
                $this->setRowTexts($rp);
            } else {
                $args["pc_search_index_ready"] = 0;
                $args["mobile_search_index_ready"] = 0;
                foreach ($this->data_fields as $field) {
                    $fields[] = "pc_" . $field . " = %pc_" . $field . "%";
                    $fields[] = "mobile_" . $field . " = %mobile_" . $field . "%";
                }

                $rp["layout_mode"] = "pc";
                $rp["text_ids"] = $args["pc_used_texts"];
                $this->setRowTexts($rp);
                $rp["layout_mode"] = "mobile";
                $rp["text_ids"] = $args["mobile_used_texts"];
                $this->setRowTexts($rp);
            }
            $sql = "
                    UPDATE
                        layout_rows
                    SET " . implode(",", $fields) . "
                    WHERE
                        id = %id%";
            $this->db->query($sql, $args);
        } else {
            if ($args["layout_mode"]) {
                $args["search_index_ready"] = 0;
                $args["search_index"] = '';

                $fields = array();
                foreach ($this->data_fields as $field) {
                    $fields[] = $args["layout_mode"] . "_" . $field;
                }
                $sql = "
                        INSERT INTO
                            layout_rows
                            (version_id, " . implode(",", $fields) . ")
                        VALUES
                            (%version_id%, %" . implode("%,%", $this->data_fields) . "%)";
            } else {
                $args["pc_search_index_ready"] = 0;
                $args["pc_search_index"] = '';
                $args["mobile_search_index_ready"] = 0;
                $args["mobile_search_index"] = '';

                $pc_fields = array();
                $mobile_fields = array();
                foreach ($this->data_fields as $field) {
                    $pc_fields[] = "pc_" . $field;
                    $mobile_fields[] = "mobile_" . $field;
                }
                $sql = "
                        INSERT INTO
                            layout_rows
                            (version_id, " . implode(",", $pc_fields) . "," . implode(",", $mobile_fields) . ")
                        VALUES
                            (%version_id%, %" . implode("%,%", $pc_fields) . "%, %" . implode("%,%", $mobile_fields) . "%)";

            }

            $this->db->query($sql, $args);
            $args["id"] = $this->db->insert_id();

            $rp["row_id"] = $args["id"];
            if ($args["layout_mode"]) {
                $rp["text_ids"] = $args["used_texts"];
                $this->setRowTexts($rp);
            } else {
                $rp["layout_mode"] = "pc";
                $rp["text_ids"] = $args["pc_used_texts"];
                $this->setRowTexts($rp);
                $rp["layout_mode"] = "mobile";
                $rp["text_ids"] = $args["mobile_used_texts"];
                $this->setRowTexts($rp);
            }
        }


        return $args["id"];
    }


    // $args: {  id: }
    function deleteRow($args)
    {
        $sql = "
                DELETE FROM
                    layout_rows
                WHERE
                    id = %id%";
        $this->db->query($sql, $args);

        $sql = "
                DELETE FROM
                    layout_rows2pages
                WHERE
                    row_id = %id%";
        $this->db->query($sql, $args);
    }


    // $args: {  page_id: }
    function deletePageRows($args)
    {
        // get page rows
        $sql = "
                SELECT
                    row_id
                FROM
                    layout_rows2pages
                WHERE
                    page_id = %page_id%";
        $page_rows = $this->db->get_vector($sql, $args);


        // check if rows used somewhere else
        $rows_to_delete = array();
        $sql = "
                SELECT
                    *
                FROM
                    layout_rows2pages
                WHERE
                    page_id <> %page_id% AND
                    row_id = %row_id%";
        for ($i = 0; $i < count($page_rows); $i++) {
            $args["row_id"] = $page_rows[$i];
            if ($this->db->get_first($sql, $args)) continue;
            $rows_to_delete[] = $page_rows;
        }

        if (!count($rows_to_delete)) return;

        for ($i = 0; $i < count($rows_to_delete); $i++) {
            $args["id"] = $rows_to_delete[$i];
            $this->deleteRow($args);
        }
    }


    // $args: {  version_id: int }
    function getPageRowsList($args)
    {
        $sql = "
                SELECT
                    p.id as page_id,
                    p.name as page_name,
                    lr2p.row_id,
                    lr2p.position,
                    lr2p.owner
                FROM
                    layout_rows2pages as lr2p
                LEFT JOIN
                    pages as p
                ON
                    p.id = lr2p.page_id
                WHERE
                    lr2p.version_id = %version_id%
                ORDER BY
                    page_id";
        $rows = $this->db->get_list($sql, $args);


        $res = array();
        foreach ($rows as $row) {
            $page_id = $row["page_id"];
            if (!$res[$page_id]) {
                $res[$page_id] = array();
            }
            if ($row["owner"]) {
                $res[$page_id][$row["position"]] = $page_id;
            } else {
                foreach ($rows as $row2) {
                    if ($row2["row_id"] == $row["row_id"] && $row2["owner"] == 1) {
                        $res[$page_id][$row["position"]] = $row2["page_id"];
                        break;
                    }
                }
            }
        }
        return $res;
    }


    // $args: { row_id }
    function getPagesByRowId($args)
    {
        $sql = "
                SELECT
                    page_id
                FROM
                    layout_rows2pages
                WHERE
                    row_id = %row_id%";
        return $this->db->get_vector($sql, $args);
    }


    // $args: {  version_id: int }
    function initSearchIndex($args)
    {
        $sql = "
                SELECT
                    id as row_id
                FROM
                    layout_rows
                WHERE
                    version_id = %version_id% AND
                    (pc_search_index_ready = 0 OR mobile_search_index_ready = 0)";

        $rows = $this->db->get_list($sql, $args);


        if (!count($rows)) return;

        $sql = "
                UPDATE
                    layout_rows
                SET
                    pc_search_index = %pc_search_index%,
                    mobile_search_index = %mobile_search_index%,
                    pc_search_index_ready = 1,
                    mobile_search_index_ready = 1
                WHERE
                    id = %row_id%";

        $this->dialog->useAppAPI("texts_manager/site_texts");
        for ($i = 0; $i < count($rows); $i++) {
            $row = $rows[$i];
            $row["layout_mode"] = "pc";
            $p = array(
                "id" => $this->getRowTexts($row)
            );

            if (is_array($p["id"]) && count($p["id"])) {
                $row["pc_search_index"] = $this->dialog->site_texts->createIndex($p);
            } else {
                $row["pc_search_index"] = "";
            }


            $row["layout_mode"] = "mobile";
            $p = array(
                "id" => $this->getRowTexts($row)
            );
            if (is_array($p["id"]) && count($p["id"])) {
                $row["mobile_search_index"] = $this->dialog->site_texts->createIndex($p);
            } else {
                $row["mobile_search_index"] = "";
            }

            $this->db->query($sql, $row);
        }
    }


    // $args: {  text_id: int, version_id: int}
    function removeSearchIndex($args)
    {
        $sql = "
                UPDATE
                    layout_rows
                SET
                    pc_search_index_ready = 0,
                    mobile_search_index_ready = 0
                WHERE
                    id IN (SELECT
                        row_id
                    FROM
                        layout_rows2texts
                    WHERE
                        version_id = %version_id% AND
                        text_id = %text_id%)";
        $this->db->query($sql, $args);
    }





    // style
    // $args: {  id: int, style_id: int, layout_mode: str }
    function setStyle($args)
    {
        $sql = "
                UPDATE
                    layout_rows
                SET
                    " . $args["layout_mode"] . "_style_id = %style_id%
                WHERE
                    id = %id%";
        $this->db->query($sql, $args);
    }



    /*
        $sid - src site id
        $did - dst site id
        $pconv - array(
            old_page_id: new_page_id,
            ...
        )
        $tconv - array(
            old_text_id: new_text_id,
            ...
        )
    */
//        function copySiteData($sid, $did, &$pconv, &$tconv) {
    function copySiteData($src_pointer, $dst_pointer, &$pconv, &$tconv, &$sconv)
    {
        $this->dialog->useAPI("json");

        $rconv = array();

        // copy rows
        $sql = "
                SELECT
                    *
                FROM
                    layout_rows
                WHERE
                    version_id = %version_id%";
        $rows = $this->db->get_list($sql, $src_pointer);
        foreach ($rows as $row) {
            $row["version_id"] = $dst_pointer["version_id"];

            if ($sconv) {
                if ($row["pc_style_id"] && $sconv[$row["pc_style_id"]]) $row["pc_style_id"] = $sconv[$row["pc_style_id"]];
                if ($row["mobile_style_id"] && $sconv[$row["mobile_style_id"]]) $row["mobile_style_id"] = $sconv[$row["mobile_style_id"]];

                if ($row["pc_used_styles"] != "") {
                    $old_row_styles = explode(";", $row["pc_used_styles"]);
                    $new_row_styles = array();
                    foreach ($old_row_styles as $style_id) {
                        if ($sconv[$style_id]) {
                            $new_row_styles[] = $sconv[$style_id];
                        } else {
                            $new_row_styles[] = $style_id;
                        }
                    }
                    $row["pc_used_styles"] = implode(";", $new_row_styles);
                }

                if ($row["mobile_used_styles"] != "") {
                    $old_row_styles = explode(";", $row["mobile_used_styles"]);
                    $new_row_styles = array();
                    foreach ($old_row_styles as $style_id) {
                        if ($sconv[$style_id]) {
                            $new_row_styles[] = $sconv[$style_id];
                        } else {
                            $new_row_styles[] = $style_id;
                        }
                    }
                    $row["mobile_used_styles"] = implode(";", $new_row_styles);
                }
            }

            $p = array(
                "row_id" => $row["id"],
                "layout_mode" => "pc"
            );
            $text_ids = $this->getRowTexts($p);
            $new_text_ids = array();
            for ($j = 0; $j < count($text_ids); $j++) {
                $new_text_ids[] = $tconv[$text_ids[$j]];
            }
            $row["pc_used_texts"] = $new_text_ids;

            $p["layout_mode"] = "mobile";
            $text_ids = $this->getRowTexts($p);
            $new_text_ids = array();
            for ($j = 0; $j < count($text_ids); $j++) {
                $new_text_ids[] = $tconv[$text_ids[$j]];
            }
            $row["mobile_used_texts"] = $new_text_ids;

            $old_row_id = $row["id"];
            unset($row["id"]);

            $this->updateProfiles($row["pc_data"], $tconv, $sconv);
            $this->updateProfiles($row["mobile_data"], $tconv, $sconv);

            $rconv[$old_row_id] = $this->setRow($row);
        }


        // copy rows2pages
        $sql = "
                SELECT
                    *
                FROM
                    layout_rows2pages
                WHERE
                    version_id = %version_id%";
        $list = $this->db->get_list($sql, $src_pointer);

        $sql = "
                INSERT INTO
                    layout_rows2pages
                    (version_id, page_id, row_id, position, owner)
                VALUES
                    (%version_id%, %page_id%, %row_id%, %position%, %owner%)";
        for ($i = 0; $i < count($list); $i++) {
            $list[$i]["version_id"] = $dst_pointer["version_id"];
            $list[$i]["page_id"] = $pconv[$list[$i]["page_id"]];
            $list[$i]["row_id"] = $rconv[$list[$i]["row_id"]];
            $this->db->query($sql, $list[$i]);
        }

        $list = null;
    }


    // $args: {  src_version_id: int, dst_version_id: int }
    function cloneVersionData($args, &$pconv)
    {
        $this->dialog->useAPI("json");
        $rconv = array();

        // clone rows
        $sql = "
                SELECT
                    *
                FROM
                    layout_rows
                WHERE
                    version_id = %src_version_id%";
        $rows = $this->db->get_list($sql, $args);
        foreach ($rows as $row) {
            $row["version_id"] = $args["dst_version_id"];

            $p = array(
                "row_id" => $row["id"],
                "layout_mode" => "pc"
            );
            $row["pc_used_texts"] = $this->getRowTexts($p);
            $p["layout_mode"] = "mobile";
            $row["mobile_used_texts"] = $this->getRowTexts($p);

            $old_row_id = $row["id"];
            unset($row["id"]);
            $rconv[$old_row_id] = $this->setRow($row);
        }


        // clone rows2pages
        $sql = "
                SELECT
                    *
                FROM
                    layout_rows2pages
                WHERE
                    version_id = %src_version_id%";
        $list = $this->db->get_list($sql, $args);

        $sql = "
                INSERT INTO
                    layout_rows2pages
                    (version_id, page_id, row_id, position, owner)
                VALUES
                    (%version_id%, %page_id%, %row_id%, %position%, %owner%)";
        for ($i = 0; $i < count($list); $i++) {
            $list[$i]["version_id"] = $args["dst_version_id"];
            $list[$i]["page_id"] = $pconv[$list[$i]["page_id"]];
            $list[$i]["row_id"] = $rconv[$list[$i]["row_id"]];
            $this->db->query($sql, $list[$i]);
        }
        $list = null;

    }


    function updateProfiles(&$data, &$tconv, $sconv)
    {
        if (!empty($data) && strpos($data, "profiles:{}") === false) {
            $data = str_replace("\\'", "", $data);
            $data = preg_replace("/\"id\":(\d+)/", "\"id\":\"$1\"", $data);

            $data_js = $this->dialog->json->decode($data);
            foreach ($data_js["profiles"] as $wid => $profile) {
                if (is_array($profile["texts"])) {
                    for ($j = 0; $j < count($profile["texts"]); $j++) {
                        $profile["texts"][$j] = $tconv[$profile["texts"][$j]];
                    }
                }

                if (is_array($profile["text_ids"])) {
                    for ($j = 0; $j < count($profile["text_ids"]); $j++) {
                        $profile["text_ids"][$j] = $tconv[$profile["text_ids"][$j]];
                    }
                }

                if (is_numeric($profile["description_id"])) {
                    $profile["description_id"] = $tconv[$profile["description_id"]];
                }

                if (is_array($profile["slides"])) {
                    for ($j = 0; $j < count($profile["slides"]); $j++) {
                        $profile["slides"][$j]["doc"]["id"] = $tconv[$profile["slides"][$j]["doc"]["id"]];
                    }
                }

                if (is_numeric($profile["content_doc_id"])) {
                    $profile["content_doc_id"] = $tconv[$profile["content_doc_id"]];
                }

                if (is_numeric($profile["popup_doc_id"])) {
                    $profile["popup_doc_id"] = $tconv[$profile["popup_doc_id"]];
                }

                if (is_numeric($profile["text_id"])) {
                    $profile["text_id"] = $tconv[$profile["text_id"]];
                }

                if ($profile["theme2_style_id"] && $sconv && $sconv[$profile["theme2_style_id"]]) {
                    $profile["theme2_style_id"] = $sconv[$profile["theme2_style_id"]];
                }

                $data_js["profiles"][$wid] = $profile;
            }
            $data = $this->dialog->json->encode($data_js);
            $data_js = null;
        }
    }


    // $args: {  version_id: int, row_id: int, layout_mode: str, text_ids: array of int }
    function setRowTexts($args)
    {
        $this->deleteRowText($args);
        if (!is_array($args["text_ids"]) || count($args["text_ids"]) == 0) return;

        $sql = "
                INSERT INTO
                    layout_rows2texts
                    (version_id, row_id, text_id, layout_mode)
                VALUES
                    (%version_id%, %row_id%, %text_id%, %layout_mode%)";
        for ($i = 0; $i < count($args["text_ids"]); $i++) {
            $args["text_id"] = $args["text_ids"][$i];
            if ($args["text_id"]) {
                $this->db->query($sql, $args);
            }
        }
    }


    // $args: { row_id: int, layout_mode: str }
    function getRowTexts($args)
    {
        $sql = "
                SELECT
                    text_id
                FROM
                    layout_rows2texts
                WHERE
                    layout_mode = %layout_mode% AND
                    row_id = %row_id%";
        return $this->db->get_vector($sql, $args);
    }


    // $args: { layout_mode: str, row_id or text_id: int }
    function deleteRowText($args)
    {
        $sql = "
                DELETE FROM
                    layout_rows2texts
                WHERE
                    layout_mode = %layout_mode% AND ";
        if (isset($args["row_id"])) {
            $sql .= "row_id = %row_id%";
        } else {
            $sql .= "text_id = %text_id%";
        }
        $this->db->query($sql, $args);
    }


}

?>