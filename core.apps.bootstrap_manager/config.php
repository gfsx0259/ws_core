<?php

$config["js_apps"]["core.apps.bootstrap_manager"] = array(

    'general' => array(
        'title' => 'Bootstrap manager',
        'name' => 'bootstrap_manager',//should be like 3th part of folder
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
            "code" => array("bootstrap_manager.js"),
            "templates" => array(
                "templates/bootstrap_manager.xml"
            ),
            "styles" => array("styles.css")
        )
    )

);