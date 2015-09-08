<?

    $config["js_apps"]["core.apps.users_manager"] = array(

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