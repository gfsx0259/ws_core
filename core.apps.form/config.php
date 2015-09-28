<?

$config["js_apps"]["core.apps.form"] = array(

    'general' => array(
        'title' => 'Form',
        'name' => 'form',//should be like 3th part of folder
        'version' => '1.0.0',
        'category' => CATEGORY_FORMS,
        'description' => '',
        'depends'=>[
            'forms_manager',
            'form',
            'form_builder',
            'form_select',
            'forms_data'
        ]
    ),

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