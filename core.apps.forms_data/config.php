<?

$config["js_apps"]["core.apps.forms_data"] = array(

    'general' => array(
        'title' => 'Forms data',
        'name' => 'forms_data',//should be like 3th part of folder
        'version' => '1.0.0',
        'category' => CATEGORY_HIDDEN,
        'description' => '',
        'depends'=>[
            'forms_manager',
            'form',
            'form_builder',
            'form_select'

        ]
    ),

    "content" => array(
        USERTYPE_ADMIN => array(
            "code" => array("forms_data.js"),
            "templates" => array("templates/forms_data.xml"),
            "styles" => array("styles.css")
        )
    )

)


?>