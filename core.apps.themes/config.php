<?php

$config["js_apps"]["core.apps.themes"] = array(

    'general' => array(
        'title' => 'Themes',
        'name' => 'themes',//should be like 3th part of folder
        'version' => '1.0.0',
        'category' => CATEGORY_HIDDEN,
        'description' => '',//core widget
        'depends' => [
            'admin_toolbars'
        ]
    ),

    "content" => array(
        USERTYPE_ADMIN => array(
            "code" => array("themes.js"),
            "templates" => array("templates/themes_list.xml"),
            "styles" => array("styles.css")
        )
    )

);


