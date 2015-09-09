<?

$config["js_apps"]["core.apps.help_center"] = array(

    'general' => array(
        'title' => 'Help center',
        'name' => 'help_center',//should be like 3th part of folder
        'version' => '1.0.0',
        'category' => CATEGORY_HIDDEN,
        'description' => ''
    ),

    "content" => array(
        USERTYPE_ADMIN => array(
            "code" => array("help_center.js"),
            "templates" => array("help_center.xml"),
            "styles" => array("styles.css")
        ),
        USERTYPE_CONTRIBUTOR => array(
            "code" => array("help_center.js"),
            "templates" => array("help_center.xml"),
            "styles" => array("styles.css")
        )
    )

)


?>