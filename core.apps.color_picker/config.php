<?

$config["js_apps"]["core.apps.color_picker"] = array(
    'general' => array(
        'title' => 'Color Picker',
        'name' => 'color_picker',//should be like 3th part of folder
        'version' => '1.0.0',
        'category' => CATEGORY_HIDDEN
    ),
    "content" => array(
        USERTYPE_ADMIN => array(
            "code" => array("color_picker.js"),
            "templates" => array("templates/color_picker.xml"),
            "styles" => array("styles.css")
        ),

        USERTYPE_CONTRIBUTOR => array(
            "code" => array("color_picker.js"),
            "templates" => array("templates/color_picker.xml"),
            "styles" => array("styles.css")
        )
    )

)


?>