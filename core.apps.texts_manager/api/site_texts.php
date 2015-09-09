<?

class api_site_texts
{


    function getList()
    {
        $sql = "
                SELECT
                    id,
                    title
                FROM
                    texts";
        return $this->db->get_list($sql);
    }


    // args: { title, content, created, modified, size, author}
    function create(&$args)
    {
        if (!isset($args["created"])) {
            $args["created"] = time();
        }
        if (!isset($args["modified"])) {
            $args["modified"] = $args["created"];
        }
        if (!isset($args["tags"])) {
            $args["tags"] = "";
        }
        if (!isset($args["author"])) {
            $args["author"] = "";
        }
        $sql = "
                INSERT INTO
                    texts
                    (title, content, tags, created, modified, size,summary, author)
                VALUES
                    (
                     %title%, 
                     %content%,
                     %tags%,
                     %created%,
                     %modified%,
                     %size%,
                     %summary%,
                     %author%)";
        $args["size"] = strlen($args["content"]);
        if (!isset($args["title"])) {
            $args["title"] = "";
        }
        $this->db->query($sql, $args);
        return $this->db->insert_id();
    }


    // args: {id,  title, content, modified}
    function update(&$args)
    {
        $sql = "
                UPDATE
                    texts
                SET ";
        if (isset($args["title"])) {
            $sql .= "title = %title%, ";
        }
        if (isset($args["content"])) {
            $args["size"] = strlen($args["content"]);
            $sql .= "content = %content%, size = %size%, ";
        }
        if (!isset($args["modified"])) {
            $args["modified"] = time();
        }
        if (isset($args["tags"])) {
            $sql .= "tags = %tags%,";
        }
        if (isset($args["summary"])) {
            $sql .= "summary = %summary%,";
        }
        if (isset($args["author"])) {
            $sql .= "author = %author%,";
        }
        $sql .= "
                    modified = %modified%
                WHERE
                    id = %id%";
        $this->db->query($sql, $args);

        $this->dialog->useAppAPI('layout_columns/layout_rows');
        $p = array(
            "text_id" => $args["id"],
            "version_id" => $this->dialog->site_version["id"]
        );
        $this->dialog->layout_rows->removeSearchIndex($p);

        return $args["id"];
    }


    function &get($args)
    {
        if (is_array($args) && array_key_exists("tags", $args)) {
            $tags = explode(",", $args["tags"]);
            foreach ($tags as $key => $tag) {
                $tags[$key] = '"' . trim($tag) . '"';
            };
            $args["tags"] = implode(" ", $tags);

            $sql = "SELECT id FROM texts WHERE MATCH (tags) AGAINST (%tags% IN BOOLEAN MODE)";
            $res = $this->db->get_list($sql, $args);
            return $res;
        }
        if (!is_array($args["id"])) {
            $sql = "
                    SELECT 
                        *
                    FROM
                        texts
                    WHERE
                        id = %id%";
            return $this->db->get_first($sql, $args);
        } elseif (count($args["id"])) {
            $sql = "
                    SELECT 
                        *
                    FROM
                        texts
                    WHERE
                        id IN(" . implode(",", $args["id"]) . ") ";
            return $this->db->get_list($sql, $args);
        }
        return array();
    }


    // args: {  [text] }
    function search(&$args)
    {
        $sql = "
                SELECT
                    id,
                    title,
                    size,
                    created,
                    modified,
                    tags,
                    summary,
                    author
                FROM
                    texts";
        if (isset($args["text"]) && $args["text"] != "") {
            $sql .= " AND (title like %text% OR content like %text% OR tags like %text% OR summary like  %text% )";
            $args["text"] = "%" . $args["text"] . "%";
        }
        $sql .= " ORDER BY created ";

        return $this->db->get_list($sql, $args);
    }


    function getIdsList()
    {
        $sql = "
                SELECT
                    id
                FROM
                    texts";
        return $this->db->get_vector($sql);
    }


    function delete(&$args)
    {
        $sql = "
                DELETE FROM
                    texts
                WHERE
                    id = %id%";
        $this->db->query($sql, $args);


        $this->dialog->useAPI("layout_rows");
        $p = array(
            "text_id" => $args["id"]
        );
        $this->dialog->layout_rows->removeSearchIndex($p);
        $this->dialog->layout_rows->deleteRowText($p);
    }


    function getPageTexts($page)
    {
        $p = array(
            "page_id" => $page["id"],
            "version_id" => $page["version_id"],
            "layout_mode" => $this->dialog->layout_mode
        );
        $this->dialog->useAPI("layout_rows");
        $rows = $this->dialog->layout_rows->getPageRows($p);


        $text_ids = array();
        foreach ($rows as $row) {
            $text_ids = array_merge($text_ids, $row["used_texts"]);
        }
        $text_ids = array_unique(array_filter($text_ids));


        if (count($text_ids)) {
            $sql = "
                    SELECT 
                        title,
                        id,
                        content,
                        summary,
                        modified,
                        created,
                        tags,
                        author
                    FROM
                        texts
                    WHERE
                        id IN (" . implode(",", $text_ids) . ")
                    ORDER BY 
                        created DESC";
            return $this->db->get_list($sql);
        } else {
            return false;
        }
    }


    // $args: {  id: [] }
    function createIndex($p)
    {
        $res = "";

        $texts = $this->get($p);
        if ($texts["id"]) {
            $texts = array($texts);
        }
        for ($i = 0; $i < count($texts); $i++) {
            $str = strip_tags($texts[$i]["content"]);
            $str = preg_replace("|\b[\d\w]{1,3}\b|i", "", $str);
            $str = preg_replace("|[^\d\w ]+|i", "", $str);
            $str = preg_replace("|[\s]+|i", " ", $str);
            $res .= $str . " ";
        }
        return $res;
    }


    // $args: {  id: int, version_id: int }
    function getPages($args)
    {
        $sql = "
                SELECT
                    name
                FROM
                    pages
                WHERE   
                    version_id = %version_id% AND
                    id IN (
                    SELECT
                        lr2p.page_id
                    FROM
                        layout_rows2texts as lr2t
                    LEFT JOIN
                        layout_rows2pages as lr2p
                    ON
                        lr2p.row_id = lr2t.row_id
                    WHERE
                        lr2t.version_id = %version_id% AND
                        lr2t.text_id = %id%)";

        return $this->db->get_vector($sql, $args);
    }


}

?>