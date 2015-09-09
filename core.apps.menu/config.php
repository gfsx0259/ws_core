<?

$config["js_apps"]["core.apps.menu"] = array(

    'general' => array(
        'title' => 'Site menu',
        'name' => 'menu',//should be like 3th part of folder
        'version' => '1.0.0',
        'icon' => 'icon.png',
        'category' => CATEGORY_NAVIGATE,
        'description' => '',
        'depends' => [
            'ecommerce',
            'ecommerce_product',
            'ecommerce_category',
            'ecommerce_brands_menu'
        ]
    ),

    "content" => array(
        USERTYPE_ADMIN => array(
            "code" => array(
                "menu.js",
                "menu.admin.js"
            )
        ),


        USERTYPE_CONTRIBUTOR => array(
            "code" => array(
                "menu.js"
            )
        ),


        USERTYPE_GUEST => array(
            "code" => array(
                "menu.js"
            )
        )
    )

)


?>