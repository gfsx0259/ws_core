<?

$config["js_apps"]["core.apps.image_editor"] = array(

    'general' => array(
        'title' => 'Image editor',
        'name' => 'image_editor',//should be like 3th part of folder
        'version' => '1.0.0',
        'category' => CATEGORY_HIDDEN,
        'description' => ''
    ),

    "content" => array(
        USERTYPE_ADMIN => array(
            "code" => array("image_editor.js"),
            "templates" => array("templates/image_editor.xml"),
            "styles" => array("styles.css")
        ),

        USERTYPE_CONTRIBUTOR => array(
            "code" => array("image_editor.js"),
            "templates" => array("templates/image_editor.xml"),
            "styles" => array("styles.css")
        )
    )

)


?>