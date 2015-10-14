<?php

class api_bootstrap{

    function get_list(){
        global $config;
        $files =  $this->glob_recursive($config["storage"]."*.css");
        foreach($files as &$file){
            if(strpos($file,$config["storage"])==0){
                $file = substr($file,strlen($config['storage']));
            }
        }
        return $files;
    }

    function glob_recursive($pattern, $flags = 0){
        $files = glob($pattern, $flags);
        foreach (glob(dirname($pattern).'/*', GLOB_ONLYDIR|GLOB_NOSORT) as $dir) {
            $files = array_merge($files, $this->glob_recursive($dir.'/'.basename($pattern), $flags));
        }
        return $files;
    }
}