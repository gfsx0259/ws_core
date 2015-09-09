<?

class api_filesmanager_search
{


    function getAllData()
    {
        $sql = "
                 SELECT
                     folder,
                     data
                 FROM
                     filesmanager_search";
        return $this->db->get_key_list($sql, null, "folder");
    }


    // $data: {  folder: "", data:"" }
    function setSectionData($data)
    {
        $sql = "
                INSERT INTO
                    filesmanager_search
                    (
                      folder,
                      data
                    )
                VALUES
                    (
                      %folder%,
                      %data%
                    )
                ON DUPLICATE KEY UPDATE
                    data = %data%";
        $this->db->query($sql, $data);
    }


}

?>