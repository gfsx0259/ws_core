<?

    $config["js_apps"]["core.apps.site_footer"] = array(

        "content" => array(
            USERTYPE_ADMIN => array(
                "code" => array("site_footer.js"),
                "templates" => array("templates/site_footer.xml")
            ),

            USERTYPE_CONTRIBUTOR => array(
                "code" => array("site_footer.js"),
                "templates" => array("templates/site_footer.xml")
            ),

            USERTYPE_GUEST => array(
                "code" => array("site_footer.js"),
                "templates" => array("templates/site_footer.xml")
            )
        )

    )


?>