<?

    $config["js_apps"]["core.apps.columns"] = array(

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