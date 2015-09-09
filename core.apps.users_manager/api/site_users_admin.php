<?

class api_site_users_admin
{

    // users manager


    // data: {  offset:int, per_page:int, q: str, confirmed: int }
    function &search($p)
    {
        $where = array();

        if (isset($p["approved"])) {
            $where[] = "approved = %approved%";
        }
        if (isset($p["confirmed"])) {
            $where[] = "confirmed = %confirmed%";
        }
        if (isset($p["contributor"])) {
            $where[] = "contributor = %contributor%";
        }

        if (isset($p["q"])) {
            $tmp = explode(" ", $p["q"]);
            $qidx = 1;

            $qsql = "(email LIKE %q% ";
            $p["q"] = "%" . $p["q"] . "%";

            foreach ($tmp as $word) {
                if (is_numeric($word)) {
                    $word = (int)$word;
                    $qsql .= " OR id= " . $word . " OR ext_id = " . $word;
                } else if (strlen($word) >= 3) {
                    $qsql .= "OR first_name LIKE %q" . $qidx . "% OR last_name LIKE %q" . $qidx . "%";
                    $p["q" . $qidx] = "%" . $word . "%";
                }
            }
            $where[] = $qsql . ")";
        }

        if(count($where)>0){
            $where = implode(" AND ", $where);
        }else{
            $where = 'true';
        }

        $sql = "
                SELECT
                    count(*)
                FROM
                    site_users
                WHERE
                    " . $where;
        $res = array(
            "total" => $this->db->get_one($sql, $p)
        );


        $sql = "
                SELECT
                    *
                FROM
                    site_users
                WHERE 
                    " . $where . "
                ORDER BY 
                    id
                LIMIT " . $p["offset"] . "," . $p["per_page"];

        $res["data"] = $this->db->get_list($sql, $p);
        return $res;
    }


    // data: {  key1, key2, .... }
    function massUpdate($data)
    {
        $sql_set = array();
        foreach ($data as $k => $v) {
            $sql_set[] = $k . "=%" . $k . "%";
        }
        if (!count($sql_set)) return;

        $sql = "
                UPDATE
                    site_users
                SET
                    " . implode(",", $sql_set);
        $this->db->query($sql, $data);
    }


    // $args: { id: int}
    function delete($args)
    {
        $sql = "
                DELETE FROM
                    site_users
                WHERE
                    id = %id%
                LIMIT 1";
        return $this->db->query($sql, $args);
    }


    // new
    function &getNotApproved($d)
    {
        $sql = "
                SELECT
                    count(*)
                FROM
                    site_users
                WHERE 
                    approved = 0
                LIMIT " . $d["offset"] . "," . $d["per_page"];
        $res = array(
            "total" => $this->db->get_one($sql, $d)
        );


        $sql = "
                SELECT
                    *
                FROM
                    site_users
                WHERE
                    approved = 0
                ORDER BY 
                    id
                LIMIT " . $d["offset"] . "," . $d["per_page"];

        $res["data"] = $this->db->get_list($sql, $d);
        return $res;
    }


    // data: {  ids: [user ids] }
    function approve($d)
    {
        if (!is_array($d["id"])) {
            $d["id"] = array($d["id"]);
        }
        if (!count($d["id"])) return;
        $sql = "
                UPDATE
                    site_users
                SET
                    approved = 1,
                    reg_reason = ''
                WHERE
                    id IN (" . implode(",", $d["id"]) . ")";
        $this->db->query($sql, $d);
    }


}

?>