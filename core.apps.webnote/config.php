<?

    $config["js_apps"]["core.apps.webnote"] = array(

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