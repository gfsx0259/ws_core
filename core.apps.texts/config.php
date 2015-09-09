<?

$config["js_apps"]["core.apps.texts"] = array(

    'general' => array(
        'title' => 'Texts',
        'name' => 'texts',//should be like 3th part of folder
        'version' => '1.0.0',
        'category' => CATEGORY_HIDDEN,
        'depends' => [
            'texts_manager'
        ]
    ),

    "content" => array(
        USERTYPE_ADMIN => array(
            "code" => array(
                "texts.js",
                "texts.admin.js"
            )
        ),


        USERTYPE_CONTRIBUTOR => array(
            "code" => array(
                "texts.js",
                "texts.admin.js"
            )
        ),


        USERTYPE_GUEST => array(
            "code" => array("texts.js")
        )
    )


);

?>