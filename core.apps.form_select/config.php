<?

$config["js_apps"]["core.apps.form_select"] = array(

    'general' => array(
        'title' => 'Form select',
        'name' => 'form_select',//should be like 3th part of folder
        'version' => '1.0.0',
        'category' => CATEGORY_HIDDEN,
        'description' => '',
        'depends'=>[
            'forms_manager',
            'form',
            'form_builder',
            'forms_data'
        ]
    ),

    "content" => array(
        USERTYPE_ADMIN => array(
            "code" => array("form_select.js"),
            "templates" => array("form_select.xml"),
            "styles" => array("styles.css")

        )
    )

)


?>