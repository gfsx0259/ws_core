<?

    $config["js_apps"]["core.apps.admin_slider"] = array(

        "content" => array(
            USERTYPE_ADMIN => array(
                "code" => array(
                    "slider_obj_common.js",
                    "admin_slider.js",
                    "admin_apps_catalog.js",
//                    "admin_styles_catalog.js",
                    "admin_theme_colors.js",
                    "admin_theme_fonts.js"
                ),
                "styles" => array(
                    "styles/admin_slider.css",
                    "styles/admin_slider_scroller.css",
                    "styles/admin_apps_catalog.css",
//                    "styles/admin_styles_catalog.css",
                    "styles/preview.css",
                    "styles/drop_down_controls.css",
                    "styles/common.css",
                    "styles/admin_theme_variables.css"
                ),
                "templates" => array(
                    "templates/admin_slider.xml",
                    "templates/admin_apps_catalog.xml",
//                    "templates/admin_styles_catalog.xml",
//                    "templates/admin_styles_catalog_sections.xml",
//                    "templates/style_controls.xml",
                    "templates/admin_theme_colors.xml",
                    "templates/admin_theme_fonts.xml"
                )
            )
        )
    );
?>