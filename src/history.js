async function save_history(data){
    const save_info = await window.requires.save_dialog();
    const save_str = JSON.stringify(data.play_history, null, ' ')
    if (!save_info.canceled){
        let save_path = save_info.filePath;
        if (!save_path.endsWith(".json")){
            save_path += ".json";
        }
        window.requires.save_json_data(save_path, save_str);
    }

    // 履歴の初期化
    data.play_history = {"data" : []}
}

async function open_history(data){
    const open_list = await window.requires.open_file_list();
    if (open_list.canceled){
        return;
    }
    let dlist = [];
    
    data.ques_dir = "";
    data.qnum = 0;
    data.q_idx = 0;
    let rlist = [];
    for (let fpath of open_list.filePaths){
        json_data = await window.requires.get_json_data(fpath);
        for (let dat of json_data.data){
            dlist.push(dat.path);
            data.qnum += 1;
            rlist.push(dat);
        }
    }
    data.is_db = true;
    data.ques_path_list = dlist;
    data.db_result = rlist;
    // data.idx_filter = shuffle(Array(data.qnum).fill().map((_, i) => i));
    data.idx_filter = Array(data.qnum).fill().map((_, i) => i);
    quiz_render(data, data.ques_path_list[0]);
}

async function save_question(data){
    // 編集した問題の保存
    const save_info = await window.requires.save_dialog();
    const save_str = JSON.stringify(data.mod_ques_raw, null, ' ')
    if (!save_info.canceled){
        let save_path = save_info.filePath;
        if (!save_path.endsWith(".json")){
            save_path += ".json";
        }
        window.requires.save_json_data(save_path, save_str);
    }
}

async function db_analyze(data){
    // 成績表からレーティング他を予想する
    // 独善的だがここを詳細にしても棋力向上にはさほど意味がない。せいぜいモチベになる程度
    let hits = 0.0;
    let ev_total = 0.0;
    let rank_total = 0.0;

    let hits_black = 0.0;
    let ev_total_black = 0.0;
    let rank_total_black = 0.0;
    let hits_white = 0.0;
    let ev_total_white = 0.0;
    let rank_total_white = 0.0;
    let q_black = 0.0;
    let q_white = 0.0;    
    
    for (let dat of data.db_result){
        let add_black = false;
        let add_white = false;
        if (dat.path.indexOf("_b_") != -1){
            add_black = true;
            q_black += 1;
        }
        if (dat.path.indexOf("_w_") != -1){
            add_white = true;
            q_white += 1;
        }
        if(dat.rank == 0){
            hits += 1;
            if (add_black){
                hits_black += 1;
            }
            if (add_white){
                hits_white += 1;
            }
        }
        rank_total += Number(dat.rank);
        ev_total += Number(dat.value);
        if (add_black){
            rank_total_black += Number(dat.rank);
            ev_total_black += Number(dat.value);
        }
        if (add_white){
            rank_total_white += Number(dat.rank);
            ev_total_white += Number(dat.value);
        }
    }
    return {
        "hits" : hits,
        "rank_total" : rank_total,
        "ev_total" : ev_total,
        "total" : data.db_result.length,
        "hits_p" :  Math.round( 100 * (hits/(0.00001 +data.db_result.length)) * Math.pow( 10, 2) ) / Math.pow( 10, 2),
        "ev_avg" : ev_total / (0.00001 + data.db_result.length),
        "rank_avg" : rank_total / (0.00001 + data.db_result.length),
        "hits_black" : hits_black,
        "rank_total_black" : rank_total_black,
        "ev_total_black" : ev_total_black,
        "total_black" : q_black,
        "hits_p_black" :  Math.round( 100 * (hits_black/(0.00001 +q_black)) * Math.pow( 10, 2) ) / Math.pow( 10, 2),
        "ev_avg_black" : ev_total_black / (0.00001 +q_black),
        "rank_avg_black" : rank_total_black / (0.00001 +q_black),
        "hits_white" : hits_white,
        "rank_total_white" : rank_total_white,
        "ev_total_white" : ev_total_white,
        "total_white" : q_white,
        "hits_p_white" :  Math.round( 100 * (hits_white/(0.00001 +q_white)) * Math.pow( 10, 2) ) / Math.pow( 10, 2),
        "ev_avg_white" : ev_total_white / (0.00001 +q_white),
        "rank_avg_white" : rank_total_white / (0.00001 +q_white),
    }
}