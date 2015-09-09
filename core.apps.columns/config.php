<?

$config["js_apps"]["core.apps.columns"] = array(

    'general' => array(
        'title' => 'Core Widget: Columns',
        'name' => 'columns',//should be like 3th part of folder
        'version' => '1.0.0',
        'description' => 'Core widget (layout columns)'
    ),

    "content" => array(
        USERTYPE_ADMIN => array(
            "code" => array(
                "columns.js",
                "columns.admin.js"
            ),
            "styles" => array("columns.css")
        ),


        USERTYPE_CONTRIBUTOR => array(
            "code" => array("columns.js"),
            "styles" => array("columns.css")
        ),


        USERTYPE_GUEST => array(
            "code" => array("columns.js"),
            "styles" => array("columns.css")
        )
    )

)


?>