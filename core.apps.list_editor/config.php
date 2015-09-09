<?php

$config["js_apps"]["core.apps.list_editor"] = array(

    'general' => array(
        'title' => 'List editor',
        'name' => 'list_editor',//should be like 3th part of folder
        'version' => '1.0.0',
        'category' => CATEGORY_HIDDEN,
        'description' => ''
    ),

    "content" => array(
        USERTYPE_ADMIN => array(
            "code" => array("list_editor.js"),
            "styles" => array("styles.css"),
            "templates" => array("list_editor.xml")
        )
    )

);