<?

class api_form
{

    /*
        $struct: array(
            field_name => array(
                type => email|string|int|float|any|equal
                arg => ....
            ) || "any"
            ....
        );

        type = email|string|int|float|any

        string arg: [minlen, maxlen]
    */
    var $src;
    var $errors;
    var $success;


    function process(&$src, &$dst, &$struct)
    {
        if (!is_array($dst)) $dst = array();
        $this->src =& $src;
        $this->errors = array();
        $this->success = true;
        foreach ($struct as $k => $test) {
            if ($test == "any") {
                $dst[$k] = $src[$k];
            } else {
                $proc = "check_" . $test["type"];
                $dst[$k] = $this->$proc($k, $src[$k], $test["arg"]);
            }
        }
        return $this->success ? true : $this->errors;
    }


    function check_email($k, $v, $arg = null)
    {
        if (!preg_match("/^([a-zA-Z0-9])+([a-zA-Z0-9\._-])*@([a-zA-Z0-9_-])+([a-zA-Z0-9\._-]+)+$/", $v)) {
            $this->add_error($k);
        }
        return trim($v);
    }


    function check_string($k, $v, $arg = null)
    {
        $v = trim($v);
        if (is_array($arg)) {
            $l = strlen($v);
            if (($l < $arg[0]) || ($l > $arg[1])) {
                $this->add_error($k);
            }
        }
        return $v;
    }


    function check_int($k, $v, $arg = null)
    {
        $v = (int)$v;
        return $v;
    }


    function check_float($k, $v, $arg = null)
    {
        if (!is_float($v)) {
            $this->add_error($k);
        }
        return floatval($v);
    }


    function check_equal($k, $v, $arg = null)
    {
        if ($this->src[$arg] != $v) {
            $this->add_error($k);
        }
        return $v;
    }


    function add_error($k)
    {
        $this->success = false;
        $this->errors[$k] = true;
    }
}

?>