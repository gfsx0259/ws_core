<?

    $config["js_apps"]["core.apps.help_center"] = array(

        "content" => array(
            USERTYPE_ADMIN => array(
                "code" => array("help_center.js"),
                "templates" => array("help_center.xml"),
                "styles" => array("styles.css")
            ),
            USERTYPE_CONTRIBUTOR => array(
                "code" => array("help_center.js"),
                "templates" => array("help_center.xml"),
                "styles" => array("styles.css")
            )
        )

    )


?>