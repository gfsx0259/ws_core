<?

$config["js_apps"]["core.apps.pages_manager"] = array(

    'general' => array(
        'title' => 'Pages manager',
        'name' => 'pages_manager',//should be like 3th part of folder
        'version' => '1.0.0',
        'category' => CATEGORY_HIDDEN,
        'description' => 'Core widget (pages)',
        'depends' => [
           'admin_toolbars'
        ]
    ),


    "content" => array(
        USERTYPE_ADMIN => array(
            "code" => array(
                "pages_manager.js"
            ),
            "templates" => array(
                "templates/pages_manager.xml",
                "templates/page_properties.xml"
            ),
            "styles" => array(
                "styles.css"
            )
        )
    )

)


?>