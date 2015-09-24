<?php

ini_set("memory_limit", "100M");
set_time_limit(120);


include("system/wideimage/WideImage.inc.php");


class dialog_controller_image_editor extends dialog_controller
{

    public $appAPIs = [
        'ecommerce/ecommerce',
        'image_editor/images'
    ];


    var $maxWidth = 1024;
    var $maxHeight = 768;

    var $dirUnixMode = 0770;

    var $inputError = array(
        "status" => "error",
        "msg" => "Incorrect arguments"
    );


    function run()
    {
        parent::run();
        global $config;

        if (!$this->canEdit()) return false;

        $act = $_REQUEST["act"];

        $tmp_dir = "var/image_editor/" . "/";

        // save file, delete tmp actions
        switch ($act) {
            case "move_tmp":
                $type = str_replace("..", "", $_REQUEST["type"]);
                $new_file = str_replace("..", "", $_REQUEST["new_file"]) . "." . $type;
                $tmp_file = $tmp_dir . str_replace("..", "", $_REQUEST["tmp_file"]);
                $quality = (int)$_REQUEST["quality"];

                $ufile = $config["storage"] . "/" . $new_file;

                if (file_exists($ufile)) {
                    @unlink($ufile);
                }
                if ($type == "png") {
                    if (!@rename($tmp_file, $ufile)) $new_file = false;
                } else {
                    $img = imagecreatefrompng($tmp_file);
                    imagejpeg($img, $ufile, $quality);
                    imagedestroy($img);
                    @unlink($tmp_file);
                }
                @rmdir($tmp_dir);
                return $new_file;
                break;

            case "delete_tmp":
                @unlink($tmp_dir . str_replace("..", "", $_REQUEST["tmp_file"]));
                @rmdir($tmp_dir);
                return true;
                break;
        }


        // file names for other actions
        $dir = $config["storage"].$this->sid."/";
        if (isset($_REQUEST["file"])) {
            $isOriginal = true;
            $file_name = str_replace("..", "", $_REQUEST["file"]);
            $file = $dir . $file_name;


            $p = explode(".", $file_name);
            array_pop($p);
            $p[] = "png";
            $file_name = implode(".", $p);

            if (!file_exists($tmp_dir)) {
                if (!@mkdir($tmp_dir, $this->dirUnixMode)) {
                    return array(
                        "status" => "error",
                        "msg" => "Can't create tmp folder."
                    );
                }
            }
            $new_file = $tmp_dir . $file_name;
        } else if (isset($_REQUEST["tmp_file"])) {
            $file_name = str_replace("..", "", $_REQUEST["tmp_file"]);
            $file = $tmp_dir . $file_name;
            $new_file = $file;
        } else {
            return array(
                "status" => "error",
                "msg" => "Input file empty"
            );
        }

        $this->images->removeThumb($file_name);

        // load image
        $image = wiImage::load($file);
        if (!$image) {
            return array(
                "status" => "error",
                "msg" => "Can't read image"
            );
        }


        // resize original image to minimal possible size
        if ($isOriginal) {
            $w = $image->getWidth();
            $h = $image->getHeight();
            if ($w > $this->maxWidth) {
                $k = $w / $this->maxWidth;
                $image = $image->resize($this->maxWidth, round($h / $k));
            } else if ($h > $this->maxHeight) {
                $k = $h / $this->maxHeight;
                $image = $image->resize(round($w / $k), $this->maxHeight);
            }
        }


        // effects

        switch ($act) {

            case "resize":
                $w = (int)$_REQUEST["width"];
                $h = (int)$_REQUEST["height"];
                if (!$w || !$h) return $this->inputError;
                $new_image = $image->resize($w, $h);
                break;

            case "flip":
                $d = $_REQUEST["direction"];
                if ($d == "v") {
                    $new_image = $image->flip();
                } else if ($d == "h") {
                    $new_image = $image->mirror();
                }
                break;

            case "rotate":
                $a = (int)$_REQUEST["angle"];
                if (!$a) return $this->inputError;
                $new_image = $image->rotate($a);
                break;

            case "crop":
                $l = (int)$_REQUEST["left"];
                $t = (int)$_REQUEST["top"];
                $w = (int)$_REQUEST["width"];
                $h = (int)$_REQUEST["height"];
                if (!$w || !$h) return $this->inputError;

                $new_image = $image->crop($l, $t, $w, $h);
                break;

            case "border":
                $s = (int)$_REQUEST["size"];
                $c = $_REQUEST["color"];
                if (!$s || !preg_match('/[0-9A-F]{6}/', $c)) {
                    return $this->inputError;
                }
                $new_image = $image->border($s, $c);
                break;

            case "photo":
                $new_image = $image->photoBorder();
                break;

            case "shadow":
                $new_image = $image->shadow(1);
                break;

            case "mirrorshadow":
                $new_image = $image->mirrorShadow();
                break;

            case "perspective":
                $a = (int)$_REQUEST["angle"];
                if (($a < 0) || ($a > 90)) return $this->inputError;
                $new_image = $image->perspective($a, $_REQUEST["direction"]);
                break;

            case "roundedcorners":
                $r = (int)$_REQUEST["radius"];
                if (!$r) $r = 10;
                $new_image = $image->roundedCorners($r);
                break;
        }


        if (!$new_image) {
            return array(
                "status" => "error",
                "msg" => "Can't transform image"
            );
        }
        $new_image->saveToFile($new_file);
        @chmod($new_file, $config["unix_file_mode"]);
        return array(
            "status" => "effect_ok",
            "data" => array(
                "width" => $new_image->getWidth(),
                "height" => $new_image->getHeight(),
                "file" => $file_name
            )
        );
    }


    function canEdit()
    {
        if ($this->usertype >= USERTYPE_ADMIN) {
            return true;
        } else if ($this->usertype == USERTYPE_CONTRIBUTOR) {
            $p = $this->contributors->getData();
            if ($p["manage_files"]) return true;
        }
        return false;
    }

}