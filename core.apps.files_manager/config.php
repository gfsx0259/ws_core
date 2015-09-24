<?

$config["js_apps"]["core.apps.files_manager"] = array(

    'general' => array(
        'title' => 'Files manager',
        'name' => 'files_manager',//should be like 3th part of folder
        'version' => '1.0.0',
        'category' => CATEGORY_HIDDEN,
        'depends' => [
           // 'dialog_prompt'
        ]
    ),

    "content" => array(
        USERTYPE_ADMIN => array(
            "code" => array("files_manager.js"),
            "templates" => array(
                "templates/files_manager.xml",
                "templates/files_manager_bulk_edit.xml",
            ),
            "styles" => array("styles.css")
        ),

        USERTYPE_CONTRIBUTOR => array(
            "code" => array("files_manager.js"),
            "templates" => array(
                "templates/files_manager.xml",
                "templates/files_manager_bulk_edit.xml",
            ),
            "styles" => array("styles.css")
        )
    )

)

?>