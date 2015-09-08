<?

    $config["js_apps"]["core.apps.baloon_tooltips"] = array(

        "content" => array(
            USERTYPE_ADMIN => array(
                "code" => array(
                    "baloon_tooltips.js"
                ),
                "templates" => array(
                    "templates/baloon_tooltip.xml"
                ),
                "styles" => array(
                    "styles.css"
                )
            ),


            USERTYPE_CONTRIBUTOR => array(
                "code" => array(
                    "baloon_tooltips.js"
                ),
                "templates" => array(
                    "templates/baloon_tooltip.xml"
                ),
                "styles" => array(
                    "styles.css"
                )
            )
        )

    );
?>