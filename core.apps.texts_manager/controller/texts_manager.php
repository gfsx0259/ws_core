<?php

class dialog_controller_texts_manager extends dialog_controller
{

    public $appAPIs = ['site_texts'];

    var $allowedTags = "<p><span><div><blockquote><h1><h2><h3><h4><h5><h6><ul><li><ol><br><hr><b><u><i><img><a>";

    var $disabledAttrs = array(
        'onclick', 'ondblclick', 'onkeydown', 'onkeypress', 'onkeyup', 'onload', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'onunload'
    );


    function run()
    {
        parent::run();

        // tmp
        if (isset($_REQUEST["content"])) {
            $_REQUEST["content"] = stripslashes($_REQUEST["content"]);
        }

        if (isset($_REQUEST["summary"])) {
            $_REQUEST["summary"] = stripslashes($_REQUEST["summary"]);
        }

        switch ($_REQUEST["act"]) {

            case "create":
                if (!$this->canEdit()) return false;
                $id = $this->site_texts->create($_REQUEST);

                return $_REQUEST["get_list"] == "1" ? $this->getDocumentsList() : $id;
                break;


            case "update":
                if (!$this->canEdit()) return false;
                $res = $this->site_texts->update($_REQUEST);

                return $_REQUEST["get_list"] == "1" ? $this->getDocumentsList() : $res;
                break;


            case "delete":
                if (!$this->canEdit()) return false;

                $ids = explode("-", $_REQUEST["ids"]);
                foreach ($ids as $id) {
                    $_REQUEST["id"] = $id;
                    $this->site_texts->delete($_REQUEST);
                }

                return $this->getDocumentsList();
                break;


            case "get_content":
                $res = $this->site_texts->get($_REQUEST);
                return
                    isset($res["id"])
                        ?
                        array(
                            "id" => $res["id"],
                            "content" => $res["content"],
                            "modified" => $res["modified"],
                            "summary" => $res["summary"],
                            "tags" => $res["tags"],
                            "title" => $res["title"],
                            "author" => $res["author"]
                        )
                        :
                        null;
                break;


            case "get_list":
                if (!$this->canEdit()) return false;
                return $this->getDocumentsList();
                break;

            case "get_multiple":
                $res = $this->site_texts->get($_REQUEST);
                $ret = array();
                foreach ($res as $id) {
                    $ret[] = $id["id"] + 0;
                };
                return array("ids" => $ret);
                break;


            default:
                return false;
                break;
        }

    }


    function canEdit()
    {
        if ($this->usertype >= USERTYPE_ADMIN) {
            return true;
        } else if ($this->usertype == USERTYPE_CONTRIBUTOR) {
            $p = $this->contributors->getData();
            if ($p["manage_docs"]) return true;
        }
        return false;
    }


    function strip_tags_attributes($s)
    {
        return preg_replace('/<(.*?)>/ie', "'<' . preg_replace(array('/javascript:[^\"\']*/i', '/(" . implode('|', $this->disabledAttrs) . ")=[\"\'][^\"\']*[\"\']/i', '/\s+/'), array('', '', ' '), stripslashes('\\1')) . '>'", strip_tags($s, $this->allowedTags));
    }


    function getDocumentsList()
    {
        $rows = $this->site_texts->search($_REQUEST);
        foreach ($rows as $k => $row) {
            $p = array(
                "id" => $row["id"],
                "version_id" => $this->site_version["id"]
            );
            $rows[$k]["pages"] = $this->site_texts->getPages($p);
        }
        return $rows;
    }


}

