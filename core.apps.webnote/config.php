<?

$config["js_apps"]["core.apps.webnote"] = array(

    'general' => array(
        'title' => 'Text',
        'name' => 'webnote',//should be like 3th part of folder
        'version' => '1.0.0',
        'category' => CATEGORY_BASIC,
        'description' => '',
        'depends'=>[
            'texts_manager'
        ]
    ),

    "content" => array(
        USERTYPE_ADMIN => array(
            "code" => array(
                "webnote.js",
                "webnote.admin.js"
            ),
            "styles" => array(
                "templates/fixed.css"
            )
        ),


        USERTYPE_CONTRIBUTOR => array(
            "code" => array(
                "webnote.js",
                "webnote.contributor.js"
            ),
            "styles" => array(
                "templates/fixed.css"
            )
        ),


        USERTYPE_GUEST => array(
            "code" => array("webnote.js"),
            "styles" => array(
                "templates/fixed.css"
            )
        )
    )

)


?>