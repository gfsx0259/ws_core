<?php
/**
 * Created by PhpStorm.
 * User: TANAT
 * Date: 13.08.2015
 * Time: 13:09
 */


class api_help_center
{
    function setShowHelp($value)
    {
        $sql = "
                UPDATE `sites`
                SET `show_help` = '" . $value . "'";
        return $this->db->query($sql);
    }
}