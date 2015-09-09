<?php

class dialog_controller_baloon_tooltips extends dialog_controller
{

    public $widgetName = 'baloon_tooltips';
    public $appAPIs = [
        'baloon_tooltips'
    ];

    function run()
    {
        parent::run();
        $arr = preg_replace("/[^\d\-]+/", "", $_REQUEST["ids"]);

        $arr = explode("-", $_REQUEST["ids"]);
        $ids = array();
        for ($i = 0; $i < count($arr); $i++) {
            $id = (int)$arr[$i];
            if ($id) {
                $ids[] = $id;
            }
        }

        return array(
            "status" => "ok",
            "data" => $this->baloon_tooltips->getKeyList($ids)
        );
    }

}