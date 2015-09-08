<?

    $config["js_apps"]["core.apps.form"] = array(

        "content" => array(
            USERTYPE_ADMIN => array(
                "code" => array(
                    "form.js",
                    "form.admin.js"
                )
            ),


            USERTYPE_CONTRIBUTOR => array(
                "code" => array("form.js")
            ),


            USERTYPE_GUEST => array(
                "code" => array("form.js")
            )
        )

    )


?>