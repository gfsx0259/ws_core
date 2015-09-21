<?

$config["js_apps"]["core.apps.users_manager"] = array(

    'general' => array(
        'title' => 'Users manager',
        'name' => 'users_manager',//should be like 3th part of folder
        'version' => '1.0.0',
        'category' => CATEGORY_HIDDEN,
        'description' => ''
    ),

    "content" => array(
        USERTYPE_ADMIN => array(
            "code" => array("users_manager.js"),
            "templates" => array(
                "templates/users_manager.xml",
                "templates/users_manager_settings.xml",
                "templates/users_manager_users.xml",
                "templates/users_manager_permissions.xml",
                "templates/users_manager_moderation.xml"
            ),
            "styles" => array(
                "styles.css"
            )
        )
    )

)


?>