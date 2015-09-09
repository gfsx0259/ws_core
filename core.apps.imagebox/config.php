<?

$config["js_apps"]["core.apps.imagebox"] = array(

    'general' => array(
        'title' => 'Image box',
        'name' => 'imagebox',//should be like 3th part of folder
        'version' => '1.0.0',
        'category' => CATEGORY_HIDDEN,
        'description' => 'Images light show'
    ),

    "content" => array(
        USERTYPE_ADMIN => array(
            "code" => array("imagebox.js")
        ),

        USERTYPE_CONTRIBUTOR => array(
            "code" => array("imagebox.js")
        ),

        USERTYPE_GUEST => array(
            "code" => array("imagebox.js")
        )
    )

)


?>