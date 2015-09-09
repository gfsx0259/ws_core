<?

$config["js_apps"]["core.apps.page_title"] = array(

    'general' => array(
        'title' => 'Page title',
        'name' => 'page_title',//should be like 3th part of folder
        'version' => '1.0.0',
        'icon' => 'icon.png',
        'category' => CATEGORY_NAVIGATE,
        'description' => '',
        'depends' => [
            'menu'
        ]
    ),

    "content" => array(
        USERTYPE_ADMIN => array(
            "code" => array(
                "page_title.js",
                "page_title.admin.js"
            )
        ),


        USERTYPE_CONTRIBUTOR => array(
            "code" => array("page_title.js")
        ),


        USERTYPE_GUEST => array(
            "code" => array("page_title.js")
        )

    )

)

?>