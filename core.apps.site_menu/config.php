<?

    $config["js_apps"]["core.apps.site_menu"] = array(

        "content" => array(
            USERTYPE_ADMIN => array(
                "code" => array("site_menu.js")
            ),

            USERTYPE_CONTRIBUTOR => array(
                "code" => array("site_menu.js")
            ),

            USERTYPE_GUEST => array(
                "code" => array("site_menu.js")
            )
            
        )

    )


?>