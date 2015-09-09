<?

$config["js_apps"]["core.apps.texts_manager"] = array(

    'general' => array(
        'title' => 'Texts manager',
        'name' => 'texts_manager',//should be like 3th part of folder
        'version' => '1.0.0',
        'category' => CATEGORY_HIDDEN,
        'depends' => [
            'texts'
        ]
    ),

    "content" => array(
        USERTYPE_ADMIN => array(
            "code" => array("texts_manager.js"),
            "templates" => array("templates/texts_manager.xml"),
            "styles" => array(
                "styles.css"
            )
        ),


        USERTYPE_CONTRIBUTOR => array(
            "code" => array("texts_manager.js"),
            "templates" => array("templates/texts_manager.xml"),
            "styles" => array(
                "styles.css"
            )
        )

    )

)


?>