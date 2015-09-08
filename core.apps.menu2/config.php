<?

    $config["js_apps"]["core.apps.menu2"] = array(

        "content" => array(
            USERTYPE_ADMIN => array(
                "code" => array(
                    "menu2.js",
                    "menu2.admin.js"
                )
            ),


            USERTYPE_CONTRIBUTOR => array(
                "code" => array(
                    "menu2.js"
                )
            ),


            USERTYPE_GUEST => array(
                "code" => array(
                    "menu2.js"
                )
            )
        )

    )


?>