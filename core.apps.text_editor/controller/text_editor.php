<?php

class dialog_controller_text_editor extends dialog_controller
{

    var $APIs = array();
    var $word_structure = array();
    var $excluded_words = array(
        "there", "the", "here", "came", "old", "where", "our", "this", "what",
        "when", "where", "how", "here", "it", "hello", "&", "to", "in", "here",
        "he", "of", "when", "be", "may", "do", "for", "does", "or", "not", "as",
        "an", "to", "also", "by", "then", "they", "till", "that", "each", "either",
        "niether", "else", "en", "close", "end", "enter", "few", "fell", "find", "go",
        "get", "here", "hare", "an", "i", "or", "your", "you", "not", "just", "with", "next",
        "about", "open", "start", "force", "all", "out", "also", "between", "ok", "home",
        "say", "many", "was", "were", "am", "are", "is", "a", "b", "c", "d", "e", "f", "g", "h",
        "j", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
        "can", "add", "but", "should", "off", "also", "cross", "add", "he", "it", "you", "as", "had",
        "my", "on", "have", "said", "me", "so", "from", "no", "if", "would", "or", "been", "one", "could",
        "very", "who", "them", "we", "now", "more", "up", "will", "than", "some", "into", "any", "well",
        "much", "know", "did", "like", "upon", "such", "only", "two", "over", "too", "came", "old",
        "first", "way", "has", "though", "without", "went", "us", "make", "nothing", "shall", "back",
        "don't", "yet", "take", "every", "ever", "most", "last", "its", "those", "put", "let", "why",
        "soon", "give", "left", "get", "and", "at", "which", "their"
    );


    function run()
    {
        parent::run();
        switch ($_REQUEST["act"]) {
            case "parse":
                return $this->genrateWordCount(strip_tags(html_entity_decode($_REQUEST['content'])));
                break;
        }
    }


    function genrateWordCount($checkstring)
    {
        $word_count = 0;

        $checkstring = str_replace(array("\\n", "\\t", "\\r", ".", ",", ";", "-", "!"), "", $checkstring);
        $checkstring = explode(" ", $checkstring);

        while (list(, $word) = each($checkstring)) {
            $skip = 0;
            foreach ($this->excluded_words as $excluded_word) {
                if (preg_match('/^[\s]*' . $excluded_word . '[\s]*$/i', $word)) {
                    $skip = 1;
                    break;
                }
            }
            if (preg_match('/^[0-9]+$/', $word)) $skip = 1;
            if ($skip == 0) {
                if (preg_match("/[0-9A-Za-z�-��-��-�]/i", $word)) {
                    if (!array_key_exists(strtolower($word), $this->word_structure))
                        $this->word_structure[strtolower(stripslashes($word))] = 1;
                    else
                        $this->word_structure[strtolower(stripslashes($word))]++;
                    $word_count++;
                }
            }
        }
        arsort($this->word_structure);
        return ($this->word_structure);
    }


}