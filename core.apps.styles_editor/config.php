<?

$config["js_apps"]["core.apps.styles_editor"] = array(

    'general' => array(
        'title' => 'Styles_editor',
        'name' => 'styles_editor',//should be like 3th part of folder
        'version' => '1.0.0',
        'category' => CATEGORY_HIDDEN
    ),

    "content" => array(
        USERTYPE_ADMIN => array(
            "code" => array(
                "styles_editor.js"
            ),
            "templates" => array(
                "templates/styles_editor.xml",
                "templates/styles_editor_properties.xml"
            ),
            "styles" => array(
                "styles.css"
            )
        )
    )

)


?>