<?

    $config["js_apps"]["core.apps.page_settings"] = array(
        "content" => array(
            USERTYPE_WEBSEMBLE_ADMIN => array(
                "code" => array(
                    "page_settings.js",
                    "page_settings.ws_admin.js"
                ),
                "templates" => array(
                    "templates/page_settings.xml",
                    "templates/page_settings_properties.xml",
                    "templates/page_settings_ws_admin.xml"
                ),
                "styles" => array(
                    "styles.css"
                )
            ),

            USERTYPE_ADMIN => array(
                "code" => array(
                    "page_settings.js"
                ),
                "templates" => array(
                    "templates/page_settings.xml",
                    "templates/page_settings_properties.xml",
                    "templates/page_settings_ws_admin.xml"
                ),
                "styles" => array(
                    "styles.css"
                )
            )
        )
    );

?>