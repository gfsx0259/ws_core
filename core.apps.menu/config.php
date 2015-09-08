<?

    $config["js_apps"]["core.apps.menu"] = array(

        "content" => array(
            USERTYPE_ADMIN => array(
                "code" => array(
                    "menu.js",
                    "menu.admin.js"
                )
            ),


            USERTYPE_CONTRIBUTOR => array(
                "code" => array(
                    "menu.js"
                )
            ),


            USERTYPE_GUEST => array(
                "code" => array(
                    "menu.js"
                )
            )
        )

    )


?>