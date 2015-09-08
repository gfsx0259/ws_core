<?

    $config["js_apps"]["core.apps.theme_editor"] = array(

        "content" => array(
            USERTYPE_ADMIN => array(
                "code" => array(
                    "theme_editor.js"
                ),
                "templates" => array(
                    "templates/theme_editor.xml",
                    "templates/style_controls.xml",
                    "templates/colors.xml",
                    "templates/fonts.xml"
                ),
                "styles" => array(
                    "styles.css"
                )
            ) 
        )

    )


?>