<?

$config["js_apps"]["core.apps.breadcrumbs_old"] = array(

    'general' => array(
        'title' => 'Breadcrumbs old',
        'name' => 'breadcrumbs_old',//should be like 3th part of folder
        'category' => CATEGORY_HIDDEN
    ),


    "content" => array(
        USERTYPE_ADMIN => array(
            "code" => array("breadcrumbs.js")
        ),


        USERTYPE_CONTRIBUTOR => array(
            "code" => array("breadcrumbs.js")
        ),


        USERTYPE_GUEST => array(
            "code" => array("breadcrumbs.js")
        )

    )

)

?>