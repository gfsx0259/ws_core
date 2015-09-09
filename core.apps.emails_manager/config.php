<?php

$config["js_apps"]["core.apps.emails_manager"] = array(

    'general' => array(
        'title' => 'Emails manager',
        'name' => 'emails_manager',//should be like 3th part of folder
        'version' => '1.0.0',
        'category' => CATEGORY_HIDDEN,
        'description' => '',//required for site mailer api
        'depends' => [
            'admin_toolbars'
        ]
    ),

    "content" => array(
        USERTYPE_ADMIN => array(
            "code" => array("emails_manager.js"),
            "templates" => array("templates/emails_manager.xml"),
            "styles" => array("styles.css")
        )
    )

);