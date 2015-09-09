<?

$config["js_apps"]["core.apps.form_builder"] = array(

    'general' => array(
        'title' => 'Form builder',
        'name' => 'form_builder',//should be like 3th part of folder
        'version' => '1.0.0',
        'icon' => 'icon.png',
        'category' => CATEGORY_HIDDEN,
        'description' => '',
        'depends'=>[
            'forms_manager',
            'form',
            'form_builder',
            'form_select',
            'forms_data',
        ]
    ),

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