<?

class api_themes
{


    function getList($category = null)
    {
        $sqlAdd = ($category != null ? "AND category = %c%" : "");
        $sql = "
                SELECT
                    *
                FROM
                    themes
                WHERE
                    1 " . $sqlAdd;
        $p = array(
            "c" => $category
        );
        return $this->db->get_list($sql, $p);
    }


    // $args: {  theme_id: int }
    function applyToSite($args)
    {
        $sql = "
                UPDATE
                    sites
                SET
                    theme = %theme_id%,
                    custom_theme_id = 0,
                    pc_theme_id = 0,
                    mobile_theme_id = 0";
        $this->db->query($sql, $args);
    }


    function &getCategories()
    {
        $sql = "
                SELECT
                    *
                FROM
                    themes_categories";
        return $this->db->get_list($sql);
    }


    function getCustomCategoryId()
    {
        $sql = "
                SELECT
                    id
                FROM
                    themes_categories
                WHERE
                    type = 'custom'";
        return $this->db->get_one($sql);
    }


    function create($data)
    {
        $sql = "
                INSERT INTO
                    themes
                    ( category, name, title)
                VALUES
                    (%category%, %name%, %title%)";
        $this->db->query($sql, $data);
        return $this->db->insert_id();
    }


}

?>