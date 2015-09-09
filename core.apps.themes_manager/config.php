<?php

$config["js_apps"]["core.apps.themes_manager"] = array(

    'general' => array(
        'title' => 'Themes manager',
        'name' => 'themes_manager',//should be like 3th part of folder
        'version' => '1.0.0',
        'category' => CATEGORY_HIDDEN,
        'description' => '',//core widget
        'depends' => [
            'admin_toolbars',
            'themes',
            'styles_manager'
        ]
    ),

    "content" => array(
        USERTYPE_ADMIN => array(
            "code" => array("themes_manager.js"),
            "templates" => array(
                "templates/themes_manager.xml",
                "templates/themes_manager_theme_controls.xml"
            ),
            "styles" => array("styles.css")
        )
    )

);