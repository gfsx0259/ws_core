<?

class api_baloon_tooltips
{


    function get($id)
    {
        $sql = "
                SELECT
                    *
                FROM
                    baloon_tooltips
                WHERE
                    id = %id%";
        return $this->db->get_first($sql, $id);
    }


    function getList()
    {
        $sql = "
                SELECT
                    *
                FROM
                    baloon_tooltips";
        return $this->db->get_list($sql);
    }


    function getKeyList($ids)
    {
        $sql = "
                SELECT
                    *
                FROM
                    baloon_tooltips";

        if (is_array($ids) && count($ids) > 0) {
            $sql .= " WHERE id IN (" . implode(",", $ids) . ")";
            return $this->db->get_key_list($sql, false, "id");
        } else {
            return array();
        }
    }


    function set($args)
    {
        $sql = "
                INSERT INTO
                    baloon_tooltips
                    ( 
                    id,
                    title,
                    description
                    )
                VALUES
                    ( 
                    %id%,
                    %title%, 
                    %description%
                    )
                ON DUPLICATE KEY UPDATE
                    title = %title%,
                    description = %description%";
        $this->db->query($sql, $args);
    }


    function delete($id)
    {
        $sql = "
                DELETE FROM
                    baloon_tooltips
                WHERE
                    id = %id%
                LIMIT 1";
        $this->db->query($sql, $id);
    }


}

?>