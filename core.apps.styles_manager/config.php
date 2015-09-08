<?

    $config["js_apps"]["core.apps.styles_manager"] = array(

        "content" => array(
            USERTYPE_ADMIN => array(
                "code" => array("styles_manager.js"),
                "templates" => array(
                    "templates/styles_manager.xml",
                    "templates/style_controls.xml"
                ),
                "styles" => array("styles.css")
            )
        )

    )


?>