// クイズのディレクトリは以下の構成からなるとする
// results.json (正解などの履歴が含まれる)
// ques/*.json (クイズの生データが含まれる。クイズはsekisyuで生成されたjsonと画像などのデータからなる)

async function quiz_load(data){
    // window.requires.message_dialog('error', 'HELLO', 'hello!');
    const out = await window.requires.open_quiz_dir();
    if (out["canceled"]){
        return;
    }
    // 選んだディレクトリのjsonファイル一覧をdataに格納する
    data.ques_path_list = out["qpaths"];
    data.ques_dir = out["filePaths"][0];
    data.qnum = data.ques_path_list.length;
    data.q_idx = 0;
    data.is_db = false;
    data.db_result = [];
    // data.idx_filter = shuffle(Array(data.qnum).fill().map((_, i) => i));
    data.idx_filter = Array(data.qnum).fill().map((_, i) => i);
    quiz_render(data, data.ques_path_list[0]);
}

async function quiz_render(data, file_name){
    
    // 問題の内容を読み取る
    json_data = await window.requires.get_json_data(file_name);
    data.ques_raw_data = json_data;
    if (json_data.question_sfen){
        // dataに問題の内容を送る
        data.to_render = true;
        data.position = sfen_to_board(json_data.question_sfen);
    }
    // こっそり答えを書いておく
    data.writeAnswer();
    
}

function quiz_update(data){
    const save_str = JSON.stringify(data.ques_raw_data, null, ' ')
    if (data.battle_mode){
        const file_name = data.board_history[data.board_history.length-1-data.b_idx];
        window.requires.save_json_data(file_name, save_str);
    }else{
        const file_name = data.ques_path_list[data.q_idx];
        window.requires.save_json_data(file_name, save_str);
    }
}

const shuffle = ([...array]) => {
    for (let i = array.length - 1; i >= 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}