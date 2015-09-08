<?

    $config["js_apps"]["core.apps.layout_columns"] = array(

        "content" => array(
            USERTYPE_ADMIN => array(
                "code" => array(
                    "layout_columns.js",
                    "layout_columns.common.js",
                    "layout_columns.admin.js",
                    "layout_columns.apps_clipboard.js",
                    "layout_columns.admin.row.js",
                    "layout_parser.js",
                    "cell_resize.js",
                    "app_drag.js",
                    "app_resize.js",
                    "app_move.js"
                 ),

                "templates" => array(
                    "templates/admin_app_controls.xml",
                    "templates/admin_app_settings.xml",
                    "templates/app_window.xml"
                ),

                "styles" => array(
                    "styles/layout.css", 
                    "styles/layout.admin.css",
                    "styles/app_settings.css",
                    "styles/app_drag.css",
                    "styles/app_admin.css",
                    "styles/app_controls.admin.css"
                )
            ),



            USERTYPE_CONTRIBUTOR => array(
                "code" => array(
                    "layout_columns.js",
                    "layout_columns.common.js"
                ),
                "templates" => array("templates/app_window.xml"),
                "styles" => array("styles/layout.css")
            ),



            USERTYPE_GUEST => array(
                "code" => array(
                    "layout_columns.js",
                    "layout_columns.common.js"
                ),
                "templates" => array("templates/app_window.xml"),
                "styles" => array("styles/layout.css")
            )
        )

    )


?>