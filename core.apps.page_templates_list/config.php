<?

$config["js_apps"]["core.apps.page_templates_list"] = array(
    'general' => array(
        'title' => 'Page templates',
        'name' => 'page_templates_list',//should be like 3th part of folder
        'version' => '1.0.0',
        'category' => CATEGORY_HIDDEN,
        'description' => '',
        'depends' => [
            'pages_manager'
        ]
    ),
    "content" => array(
        USERTYPE_ADMIN => array(
            "code" => array(
                "page_templates_list.js"
            ),
            "templates" => array(
                "template.xml"
            ),
            "styles" => array(
                "styles.css"
            )
        )
    )
);

?>