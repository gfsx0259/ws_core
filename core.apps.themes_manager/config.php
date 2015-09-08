<?

    $config["js_apps"]["core.apps.themes_manager"] = array(

        "content" => array(
            USERTYPE_ADMIN => array(
                "code" => array("themes_manager.js"),
                "templates" => array(
                    "templates/themes_manager.xml",
                    "templates/themes_manager_theme_controls.xml"
                ),
                "styles" => array("styles.css")
            )
        )

    )


?>