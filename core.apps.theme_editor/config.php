<?php

$config["js_apps"]["core.apps.theme_editor"] = array(

    'general' => array(
        'title' => 'Theme editor',
        'name' => 'theme_editor',//should be like 3th part of folder
        'version' => '1.0.0',
        'category' => CATEGORY_HIDDEN,
        'description' => '',//core widget
        'depends' => [
            'themes',
            'themes_manager',
            'styles_manager'
        ]
    ),

    "content" => array(
        USERTYPE_ADMIN => array(
            "code" => array(
                "theme_editor.js"
            ),
            "templates" => array(
                "templates/theme_editor.xml",
                "templates/style_controls.xml",
                "templates/colors.xml",
                "templates/fonts.xml"
            ),
            "styles" => array(
                "styles.css"
            )
        )
    )

);