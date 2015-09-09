<?

$config["js_apps"]["core.apps.site_footer"] = array(

    'general' => array(
        'title' => 'Site footer',
        'name' => 'site_footer',//should be like 3th part of folder
        'version' => '1.0.0',
        'category' => CATEGORY_HIDDEN,
        'description' => ''
    ),

    "content" => array(
        USERTYPE_ADMIN => array(
            "code" => array("site_footer.js"),
            "templates" => array("templates/site_footer.xml")
        ),

        USERTYPE_CONTRIBUTOR => array(
            "code" => array("site_footer.js"),
            "templates" => array("templates/site_footer.xml")
        ),

        USERTYPE_GUEST => array(
            "code" => array("site_footer.js"),
            "templates" => array("templates/site_footer.xml")
        )
    )

)


?>