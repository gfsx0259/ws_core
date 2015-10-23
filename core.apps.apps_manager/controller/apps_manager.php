<?php

class dialog_controller_apps_manager extends dialog_controller
{

    public $widgetName = 'apps_manager';
    public $appAPIs = [
        'apps'
    ];
    public $log;


    function run()
    {
        parent::run();

        if ($this->usertype < USERTYPE_ADMIN) {
            return array("status" => "error");
        }

        switch ($_GET["act"]) {
            case "get_list":
                $res = array(
                    "status" => "ok",
                    "data" => $this->apps->getData()
                );
                return $res;
                break;

            case "save_vendors_list":
                if(isset($_REQUEST['vendors'])){
                    $vendors = explode(',',$_REQUEST['vendors']);
                    $this->apps->setCustomVendorsList($vendors);
                    $res = array(
                        "status" => "ok"
                    );
                }else{
                    $res = array(
                        "status" => "error"
                    );
                }
                return $res;
                break;

            case "run_command":
                $data = json_decode($_REQUEST['data']);
                if(!$data->type || !$data->app){
                    continue;
                }

                if($data->type=='install' && !(bool)$data->app->packageAvailable){
                    $this->addComposer();
                    $this->exec("php composer.phar require {$data->app->vendorName}/{$data->app->packageName}",true);
                }

                $this->exec('php cron/install_widget.php '.$data->type.' '.$data->app->vendorName.'/'.$data->app->packageName.'/'.$data->app->name);

                $res = array(
                    "status" => "ok",
                    'data'=> $this->log
                );
                return $res;
                break;

        }

        return array("status" => "error");
    }


    function addComposer()
    {
        if (!file_exists('composer.phar')) {
            $this->exec('php -r "readfile(\'https://getcomposer.org/installer\');" | php');
        }
        if (file_exists('composer.phar')) {
            return true;
        } else {
            return false;
        }
    }

    function exec($cmd,$setComposerHome = false){
        $composerPath = '';
        if($setComposerHome){
            $composerPath = 'COMPOSER_HOME="'.getcwd().'" ';
        }
        $execResult = exec($composerPath.$cmd . ' 2>&1', $out);
        if ($out && is_array($out)) {
            $this->log = implode('<br/>',$out);
            return true;
        } else {
            $this->log = 'Unexpected result ('.$cmd."):".$execResult;
            return false;
        }
    }



}