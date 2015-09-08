<?

    $config["js_apps"]["core.apps.texts"] = array(

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