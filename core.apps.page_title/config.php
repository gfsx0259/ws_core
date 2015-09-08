<?

    $config["js_apps"]["core.apps.page_title"] = array(

        "content" => array(
            USERTYPE_ADMIN => array(
                "code" => array(
                    "page_title.js",
                    "page_title.admin.js"
                )
            ),


            USERTYPE_CONTRIBUTOR => array(
                "code" => array("page_title.js")
            ),


            USERTYPE_GUEST => array(
                "code" => array("page_title.js")
            )

        )

    )

?>