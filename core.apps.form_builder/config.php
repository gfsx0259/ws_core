<?

    $config["js_apps"]["core.apps.form_builder"] = array(

        "content" => array(
            USERTYPE_ADMIN => array(
                "code" => array(
                    "form_builder.js",
                    "form_elements.js",
                    "form_visiblity_conditions.js"
                ),
                "templates" => array(
                    "templates/form_builder.xml",
                    "templates/form_builder_field_properties.xml",
                    "templates/form_builder_form_properties.xml"
                ),
                "styles" => array(
                    "styles.css"
                )
            ) 
        )

    )


?>