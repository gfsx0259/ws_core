<?

$config["js_apps"]["core.apps.desktop"] = array(

    'general' => array(
        'title' => 'Core Widget: Desktop',
        'name' => 'desktop',//should be like 3th part of folder
        'version' => '1.0.0',
        'description' => 'Core widget (Desktop)',
        'depends' => [
            'imagebox'
        ]
    ),

    "content" => array(
        USERTYPE_ADMIN => array(
            "code" => array(
                "desktop.js",
                "desktop.std.js",
                "desktop.admin.js",
                "popup_apps.js",
                "desktop.modal_dialog.js",
                "desktop.ecom_cart.js"
            ),
            "templates" => array(
                "templates/desktop_loading.xml",
                "templates/desktop_popup.xml",
                "templates/preview_panel.xml",
                "templates/app_window.xml",
                "templates/notify_bar.xml",
                "templates/modal_dialog.xml",
                "templates/ecom_subscribe_dlg.xml",
                "templates/style_select.admin.xml"
            ),
            "styles" => array(
                "styles/app.css",
                "styles/interface.css",
                "styles/interface.admin.css",
                "styles/datepicker.css",
                "styles/popups.css",
                "styles/toolbar.css",
                "styles/tree_view.css",
                "styles/interface.ecommerce.css",
                "styles/tables.admin.css",
                "styles/wsc.css",
                "styles/wsc_form.css",
                "styles/size.admin.css",
                "styles/tabs_bar.admin.css",
                "styles/loading_msg.css",
                "styles/modal_dialog.css",
                "styles/styles_select.admin.css"
            )
        ),


        USERTYPE_CONTRIBUTOR => array(
            "code" => array(
                "desktop.js",
                "desktop.std.js",
                "popup_apps.js",
                "desktop.contributor.js",
                "desktop.ecom_cart.js",
                "desktop.modal_dialog.js"
            ),
            "templates" => array(
                "templates/desktop_loading.xml",
                "templates/desktop_popup.xml",
                "templates/app_window.xml",
                "templates/ecom_subscribe_dlg.xml",
                "templates/modal_dialog.xml"
            ),
            "styles" => array(
                "styles/app.css",
                "styles/interface.css",
                "styles/datepicker.css",
                "styles/popups.css",
                "styles/toolbar.css",
                "styles/popups.css",
                "styles/wsc.css",
                "styles/wsc_form.css",
                "styles/size.admin.css",
                "styles/tabs_bar.admin.css",
                "styles/loading_msg.css",
                "styles/modal_dialog.css"
            )
        ),


        USERTYPE_GUEST => array(
            "code" => array(
                "desktop.js",
                "desktop.std.js",
                "desktop.ecom_cart.js",
                "desktop.modal_dialog.js"
            ),
            "templates" => array(
                "templates/desktop_loading.xml",
                "templates/app_window.xml",
                "templates/ecom_subscribe_dlg.xml",
                "templates/modal_dialog.xml"
            ),
            "styles" => array(
                "styles/app.css",
                "styles/interface.css",
                "styles/datepicker.css",
                "styles/toolbar.css",
                "styles/loading_msg.css",
                "styles/modal_dialog.css",
                "styles/wsc.css",
                "styles/wsc_form.css",
            )
        )

    )

)


?>