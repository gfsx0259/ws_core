<?php

$config["js_apps"]["core.apps.styles_manager"] = array(

    'general' => array(
        'title' => 'Styles manager',
        'name' => 'styles_manager',//should be like 3th part of folder
        'version' => '1.0.0',
        'category' => CATEGORY_HIDDEN,
        'description' => '',//core widget
    ),

    "content" => array(
        USERTYPE_ADMIN => array(
            "code" => array("styles_manager.js"),
            "templates" => array(
                "templates/styles_manager.xml",
                "templates/style_controls.xml"
            ),
            "styles" => array("styles.css")
        )
    )

);