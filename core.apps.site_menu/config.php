<?

$config["js_apps"]["core.apps.site_menu"] = array(

    'general' => array(
        'title' => 'Site menu',
        'name' => 'site_menu',//should be like 3th part of folder
        'version' => '1.0.0',
        'category' => CATEGORY_HIDDEN,
        'description' => ''
    ),

    "content" => array(
        USERTYPE_ADMIN => array(
            "code" => array("site_menu.js")
        ),

        USERTYPE_CONTRIBUTOR => array(
            "code" => array("site_menu.js")
        ),

        USERTYPE_GUEST => array(
            "code" => array("site_menu.js")
        )

    )

)


?>