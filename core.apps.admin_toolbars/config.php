<?

$config["js_apps"]["core.apps.admin_toolbars"] = array(
    'general' => array(
        'title' => 'Core Widget: Admin Toolbar',
        'name' => 'admin_toolbars',//should be like 3th part of folder
        'version' => '1.0.0',
        'description' => 'Core widget (toolbar)',
        'depends' => [
            'help_center',
            'page_settings',
            'page_templates_list'
        ]
    ),
    "content" => array(
        USERTYPE_ADMIN => array(
            "code" => array(
                "admin_toolbars.js",
                "prototype.js",
                "toolbar_main.js",
                "toolbar_menu.js",
                "toolbar_pages_list.js",
                "toolbar_app_settings.js",
                "toolbar_obj_settings.js",
                "toolbar_text_editor.js",
                "toolbar_theme_colors.js",
                "toolbar_theme_fonts.js"
            ),
            "styles" => array(
                "styles/admin_toolbar_window_buttons.css",
                "styles/admin_toolbar_window_list.css",
                "styles/admin_toolbar_main.css",
                "styles/admin_toolbar_pages_list.css",
                "styles/admin_toolbar_text_editor.css",
                "styles/admin_toolbar_settings.css",
                "styles/admin_toolbar_theme_colors.css",
                "styles/admin_toolbar_theme_fonts.css"
            ),
            "templates" => array(
                "templates/admin_toolbar_window_buttons.xml",
                "templates/admin_toolbar_window_list.xml",
                "templates/admin_toolbar_menu.xml",
                "templates/admin_toolbar_app_settings.xml",
                "templates/admin_toolbar_obj_settings.xml",
                "templates/admin_toolbar_text_editor.xml",
                "templates/admin_toolbar_pages_list.xml",
                "templates/admin_toolbar_pages_list_controls.xml",
                "templates/admin_toolbar_theme_colors.xml",
                "templates/admin_toolbar_theme_fonts.xml"
            ),
            "external_templates" => array(
                 array(
                    'name' => 'events_manager',
                    'template' => 'admin_toolbar_menu_events_manager.xml'
                ),
                array(
                    'name' => 'ecommerce',
                    'template' => 'admin_toolbar_menu_ecommerce.xml'
                )
            )
        )
    )
)
?>