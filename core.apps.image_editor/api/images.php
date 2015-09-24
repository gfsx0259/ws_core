<?php
ini_set("gd.jpeg_ignore_warning", 1);
ini_set("jpeg_ignore_warning", 1);
include("system/wideimage/WideImage.inc.php");

class api_images
{

    /**
     * //TODO change upload.php and image_resizer.php
     * @param $dir
     * @param $file
     * @param $newPath
     * @param $width
     * @param $height
     * @param bool $forceCreate
     * @param string $method - fill,fit,stretch
     * @return mixed - false if error
     */
    function resize($dir, $file, $width, $height, $forceCreate = true, $method = 'fill')
    {
        $newPath = $dir . $width . 'x' . $height;
        $newFullPath = $newPath . '/' . $file;
        if (!$forceCreate && file_exists($newFullPath)) {
            return $newFullPath;
        }
        if (!file_exists($newPath)) {
            @mkdir($newPath, 0777, true);
        }

        $image = false;
        try {
            $image = wiImage::load($dir . $file);
        } catch (wiInvalidImageSourceException $e) {
           // echo $e->getMessage() . "\n";
            //if resize not working , then copy as is
            return false;
        }
        if (!$image) {
            return false;
        }

        if ($width < 1 || $height < 1) return false;

        $image = $image->resize($width, $height, $method);

        if ($image) {
            $image->saveToFile($newFullPath);
            $image = null;
            return $newFullPath;
        }
    }

    function removeThumb($file){
        global $config;
        //remove thumbs
        $this->dialog->useAppAPI("ecommerce/ecommerce");
        $dir = $config["storage"].$this->dialog->site_info["id"]."/";
        $ecommerce_settings = $this->dialog->ecommerce->generalReadSettings($this->dialog->site_info["id"]);
        foreach(array('list','grid') as $mode){
            if($mode == 'list'){
                $width = $ecommerce_settings['widget_list_size_w'];
                $height = $ecommerce_settings['widget_list_size_h'];
            }else{
                $width = $ecommerce_settings['widget_grid_size_w'];
                $height = $ecommerce_settings['widget_grid_size_h'];
            }
            $newPath = $dir . $width . 'x' . $height;
            $newFullPath = $newPath . '/' . $file;
            if (file_exists($newFullPath)) {
                @unlink($newFullPath);
            }
        }
    }
}