<?

class api_session_data
{


    function __construct()
    {
        if (!$_SESSION["data"]) {
            $_SESSION["data"] = array();
        }
    }

    function get($key)
    {
        return $_SESSION["data"][$key];
    }


    function set($key, $data)
    {
        $_SESSION["data"][$key] = $data;
    }


    function delete($key)
    {
        unset($_SESSION["data"][$key]);
    }


    function getKeyList()
    {
        return $_SESSION["data"];
    }

}

?>