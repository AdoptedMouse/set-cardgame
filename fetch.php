<?php
    header('Access-Control-Allow-Origin: *', false);

    if(isset($_GET['data'])) {
        $json = json_decode(file_get_contents('score.json'));

        echo json_encode($json);
    }
    
    if(isset($_POST['score'])) {
        $score = $_POST['score'];
        $name = $_POST['name'];
        $json = json_decode(file_get_contents('score.json'), true);
        $json[$name] = $score;

        file_put_contents('score.json', json_encode($json));
    }