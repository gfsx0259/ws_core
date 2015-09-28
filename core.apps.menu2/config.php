<?

$config["js_apps"]["core.apps.menu2"] = array(

    'general' => array(
        'title' => 'Site menu v2',
        'name' => 'menu2',//should be like 3th part of folder
        'version' => '1.0.0',
        'category' => CATEGORY_NAVIGATE,
        'description' => '',
        'depends' => [
            'menu'
        ]
    ),

    "content" => array(
        USERTYPE_ADMIN => array(
            "code" => array(
                "menu2.js",
                "menu2.admin.js"
            )
        ),


        USERTYPE_CONTRIBUTOR => array(
            "code" => array(
                "menu2.js"
            )
        ),


        USERTYPE_GUEST => array(
            "code" => array(
                "menu2.js"
            )
        )
    )

)


?>