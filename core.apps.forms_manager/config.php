<?

$config["js_apps"]["core.apps.forms_manager"] = array(

    'general' => array(
        'title' => 'Forms manager',
        'name' => 'forms_manager',//should be like 3th part of folder
        'version' => '1.0.0',
        'icon' => 'icon.png',
        'category' => CATEGORY_HIDDEN,
        'description' => '',
        'depends'=>[
            'form',
            'form_builder',
            'form_select',
            'forms_data',
          //  'captcha'
        ]
    ),

    "content" => array(
        USERTYPE_ADMIN => array(
            "code" => array("forms_manager.js"),
            "templates" => array("templates/forms_manager.xml"),
            "styles" => array("styles.css")
        )
    )

)


?>