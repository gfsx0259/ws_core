<?php

$config["js_apps"]["core.apps.files_upload"] = array(

    'general' => array(
        'title' => 'Files upload',
        'name' => 'files_upload',//should be like 3th part of folder
        'version' => '1.0.0',
        'icon' => 'icon.png',
        'category' => CATEGORY_HIDDEN,
        'description' => '',
        'depends'=>[
            'files_manager'
        ]
    ),

    "content" => array(
        USERTYPE_ADMIN => array(
            "code" => array(
                "files_upload.js"
            ),
            "styles" => array("style.css"),
            "templates" => array("templates/upload_content.xml")
        ),


        USERTYPE_CONTRIBUTOR => array(
            "code" => array(
                "files_upload.js"
            ),
            "styles" => array("style.css"),
            "templates" => array("templates/upload_content.xml")
        )

    )

);