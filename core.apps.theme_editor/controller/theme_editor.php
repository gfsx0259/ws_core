<?

class dialog_controller_theme_editor extends dialog_controller
{
    public $appAPIs = [
        'themes/themes2'
    ];

    var $APIs = array(
        "css_styles"
    );


    function run()
    {
        parent::run();

        if ($this->usertype < USERTYPE_ADMIN) {
            return array("status" => "error");
        }

        global $config;

        switch ($_REQUEST["act"]) {

            case "get_data":
                $res = array(
                    "status" => "ok"
                );
                if ($_REQUEST["load_all_css_styles"] == 1) {
                    $res["css_styles"] = $this->css_styles->getAll();
                }
                $theme_id = (int)$_REQUEST["theme_id"];
                if (!$theme_id) {
                    $theme_id = $this->site_version[$this->layout_mode . "_theme_id"];
                }

                $res["theme"] = $this->themes2->get($theme_id, true);
                $p = array(
                    "id" => $theme_id
                );
                $res["styles_selection"] = $this->themes2->getStylesList($p);

                return $res;
                break;


            case "create_theme":
                break;


            case "update_theme":
                break;
        }
    }
}

?>