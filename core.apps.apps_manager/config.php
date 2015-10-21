<?php

$config["js_apps"]["core.apps.apps_manager"] = array(

    'general' => array(
        'title' => 'Apps manager',
        'name' => 'apps_manager',//should be like 3th part of folder
        'version' => '1.0.0',
        'category' => CATEGORY_HIDDEN,
        'description' => 'Allow to manage widgets on site',
        'depends' => []
    ),

    "content" => array(
        USERTYPE_ADMIN => array(
            "code" => array("apps_manager.js"),
            "templates" => array(
                "templates/apps_manager.xml"
            ),
            "styles" => array("styles.css")
        )
    )

);