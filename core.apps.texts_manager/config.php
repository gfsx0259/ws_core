<?

    $config["js_apps"]["core.apps.texts_manager"] = array(

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