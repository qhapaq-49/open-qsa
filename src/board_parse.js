const Piece = { l:'香', n:'桂', s:'銀', g:'金', k:'玉', r:'飛', b:'角', p:'歩', '+l':'杏', '+n':'圭', '+s':'全', '+r':'龍', '+b':'馬', '+p':'と', L:'香', N:'桂', S:'銀', G:'金', K:'玉', R:'飛', B:'角', P:'歩', '+L':'杏', '+N':'圭', '+S':'全', '+R':'龍', '+B':'馬', '+P':'と', "": ""};

function sfen_to_board(sfen){
    // sfenの文字列を受け取り、盤面オブジェクトを返す
    let board = new Array(9);
    for(let y = 0; y < 9; y++) {
        board[y] = new Array(9).fill("");
    }
    let position = {
        "board" : board,
        "piece_black" :[],
        "piece_white" : [],
        "turn_white" : false,
        "ply" : 1
    }

    const n = sfen.length;

    // Pices on board
    let i;
    let ix = 0;
    let iy = 0;

    let mode = 0; // todo enumする
    piece_num = 1

    for (i = 0; i < n; i++) {
        p = sfen.charAt(i);
        if (p == ' ') { // change mode
            mode += 1;
            continue;    
        }
        if (mode == 0){
            if (p == '+') {
                p = sfen.substring(i, i + 2);
                i++;
            }

            let number = Number(p);
            if (p == '/') { // Next row
                ix = 0;
                iy++;
            }
            else if (number) { // n black squares
                ix += number;
            }
            else {
                position.board[iy][ix] = p;
                ix++;
            }
        }
        else if (mode == 1){
            if(p=="w"){
                position.turn_white = true;
            }
        }
        else if (mode == 2){
            if(p == "-"){
                continue;
            }
            let number = Number(p);
            if(!number){
                if (p.toLowerCase()!=p){
                    position.piece_black.push({"piece_str" : Piece[p], "piece_type" : p, "piece_num" : piece_num});
                    if (piece_num > 1){
                        position.piece_black[position.piece_black.length-1].piece_str += piece_num;
                    }   
                }else{
                    position.piece_white.push({"piece_str" : Piece[p], "piece_type" : p, "piece_num" : piece_num});
                    if (piece_num > 1){
                        position.piece_white[position.piece_white.length-1].piece_str += piece_num;
                    }
                }
                piece_num = 1;
            }else{
                piece_num = number;
            }
        }
        else if(mode == 3){
            break;
        }
    }
    let ply_str_idx = sfen.lastIndexOf(" ");
    let ply_str = sfen.slice(ply_str_idx, sfen.length);
    position.ply = Number(ply_str);
    return position;
}

async function analyze_board_run(data){
    // windows-linux間でパスの設定が微妙に異なる
    let platform = navigator.userAgent;
    let cmd = "question_cmd_withconf.exe";
    if (platform.includes("Linux")){
        cmd = "./question_cmd_withconf.exe";
    }
    console.log(cmd + ' --config question_cmd_config.yaml --sfen "' + data.mod_sfen.replaceAll(" ", '__space__') + '"')
    // 標準出力の結果を使いたかったがwindowsでは不可な様子
    let out = await window.requires.subprocess(cmd + ' --config question_cmd_config.yaml --sfen "' + data.mod_sfen.replaceAll(" ", '__space__') + '"');
    /*
    out = out.replaceAll("'", '"');
    out = out.replaceAll("False", "false");
    let dat = JSON.parse(out);
    */
    dat = await window.requires.get_json_data("question_gen.json");
    data.mod_ques_raw = dat;
    data.writeAnswer();
}

async function analyze_kif_body(data, root_dir){
    const open_list = await window.requires.open_file_list();
    if (open_list.canceled){
        return;
    }
    // windows-linux間でパスの設定が微妙に異なる
    let platform = navigator.userAgent;
    let cmd = "question_cmd_withconf.exe";
    if (platform.includes("Linux")){
        cmd = "./question_cmd_withconf.exe";
    }
    let kif_to_open = "";
    for (let kif_name of open_list.filePaths){
        const cmd_to_use = cmd + ' --config question_cmd_config.yaml --kif "' + kif_name + '" --kif_out_root ' + root_dir
        let out = await window.requires.subprocess(cmd_to_use);
        kif_to_open = kif_name;
    }
    // 選んだディレクトリのjsonファイル一覧をdataに格納する
    kif_to_open = kif_to_open.split('/').pop()
    data.ques_path_list = await window.requires.select_json(root_dir + "/data_" + kif_to_open);
    data.ques_dir = root_dir + "/data_" + kif_to_open;
    data.qnum = data.ques_path_list.length;
    data.q_idx = 0;
    data.is_db = false;
    data.db_result = [];
    // data.idx_filter = shuffle(Array(data.qnum).fill().map((_, i) => i));
    data.idx_filter = Array(data.qnum).fill().map((_, i) => i);
    quiz_render(data, data.ques_path_list[0]);
    console.log("done");

}

function put_piece_to_hand(pos, to_sq, is_black){
    piece_str = pos.board[to_sq[0]][to_sq[1]];
    add_piece_to_hand(pos, piece_str, is_black);
    pos.board[to_sq[0]][to_sq[1]] = "";
}
function add_piece_to_hand(pos, piece, to_black){
    // 駒を駒台におく
    if(to_black){
        const piece_check = piece.replace('+', '').toUpperCase();
        let push = true;
        for (bc of pos.piece_black){
            if (bc.piece_type == piece_check){
                bc.piece_num += 1;
                bc.piece_str = Piece[piece_check] + bc.piece_num;
                push = false;
            }
        }
        if(push){
            pos.piece_black.push({"piece_str" : Piece[piece_check], "piece_type" : piece_check, "piece_num" : 1})
        }
    }else{
        const piece_check = piece.replace('+', '').toLowerCase();
        let push = true;
        for (bc of pos.piece_white){
            if (bc.piece_type == piece_check){
                bc.piece_num += 1;
                bc.piece_str = Piece[piece_check] + bc.piece_num;
                push = false;
            }
        }
        if(push){
            pos.piece_white.push({"piece_str" : Piece[piece_check], "piece_type" : piece_check, "piece_num" : 1})
        }

    }
}

function move_piece(pos, from_sq, to_sq){
    // sfen上であるsqの駒を別のsqに動かす。その際、相手の駒が取れる場合はとる
    // この関数は編集後のsfenを返す
    const to_sq_piece = pos.board[to_sq[0]][to_sq[1]];
    const from_sq_piece = pos.board[from_sq[0]][from_sq[1]];
    if (from_sq_piece == ""){
        // ここは本来到達しないはず
        console.log("unreachable!! from_sq is empty")
        return;
    }
    pos.board[to_sq[0]][to_sq[1]] = from_sq_piece;
    if (to_sq_piece != ""){
        // to_sqに既にコマがあった場合は駒台におく
        add_piece_to_hand(pos, to_sq_piece, from_sq_piece.toLowerCase()!=from_sq_piece);

    }
    pos.board[from_sq[0]][from_sq[1]] = "";
}

function drop_piece(pos, to_sq, piece, is_black){
    if(is_black){
        let purge = false;
        for (bc of pos.piece_black){
            if (bc.piece_type == piece){
                bc.piece_num -= 1;
                if(bc.piece_num == 0){
                    purge = true;
                }
                if (bc.piece_num == 1){
                    bc.piece_str = Piece[piece]
                }else{
                    bc.piece_str = Piece[piece]+bc.piece_num;
                }
            }
        }
        if(purge){
            pos.piece_black = pos.piece_black.filter((bc) => {
                return (bc.piece_type != piece);
            });
        }
        const before_sq = pos.board[to_sq[0]][to_sq[1]];
        pos.board[to_sq[0]][to_sq[1]] = piece;
        if(before_sq != ""){
            add_piece_to_hand(pos, before_sq, true);
        }
    }else{
        let purge = false;
        for (bc of pos.piece_white){
            if (bc.piece_type == piece){
                bc.piece_num -= 1;
                if(bc.piece_num == 0){
                    purge = true;
                }
                if (bc.piece_num == 1){
                    bc.piece_str = Piece[piece]
                }else{
                    bc.piece_str = Piece[piece]+bc.piece_num;
                }
            }
        }
        if(purge){
            pos.piece_white = pos.piece_white.filter((bc) => {
                return (bc.piece_type != piece);
            });
        }
        const before_sq = pos.board[to_sq[0]][to_sq[1]];
        pos.board[to_sq[0]][to_sq[1]] = piece;
        if(before_sq != ""){
            add_piece_to_hand(pos, before_sq, false);
        }
    }

}

function flip_turn(pos){
    pos.turn_white = !pos.turn_white;
}

function flip_piece(pos, to_sq){
    before_sq = pos.board[to_sq[0]][to_sq[1]];
    if( before_sq == "k" || before_sq == "K" || before_sq==""){
        return;
    }
    if (before_sq.startsWith("+") || before_sq == "g" || before_sq == "G"){
        if (before_sq.startsWith("+")){
            pos.board[to_sq[0]][to_sq[1]] = pos.board[to_sq[0]][to_sq[1]].charAt(1);
        }
        if (pos.board[to_sq[0]][to_sq[1]].toUpperCase() == pos.board[to_sq[0]][to_sq[1]]){
            pos.board[to_sq[0]][to_sq[1]] = pos.board[to_sq[0]][to_sq[1]].toLowerCase();
        }else{
            pos.board[to_sq[0]][to_sq[1]] = pos.board[to_sq[0]][to_sq[1]].toUpperCase();
        }
    }else{
        pos.board[to_sq[0]][to_sq[1]] = "+" + pos.board[to_sq[0]][to_sq[1]];
    }
}

function posdata_to_sfen(board, piece_black, piece_white, turn_white, ply){
    // board (9x9のstr配列)
    // piece_black ... 先手の持ち駒 {"piece_str" : "歩2", "piece_type" : "P", "piece_num" : 2} のような形式の配列
    // turn_white ... bool値
    // ply ... int

    let sfen = "";
    // 盤面
    for (let y = 0; y < 9; y++) {
        let skip_cnt = 0;
        for (let x = 0; x < 9; x++){
            if (board[y][x] == ""){
                skip_cnt += 1;
            }else{
                if(skip_cnt > 0){
                    sfen += skip_cnt;
                }
                sfen += board[y][x];
                skip_cnt = 0;
            }
        }
        if (skip_cnt > 0){
            sfen += skip_cnt;
        }
        if (y < 8){
            sfen += "/";
        }
    }

    // 手番
    sfen += " ";
    if (turn_white){
        sfen += "w";
    }else{
        sfen += "b";
    }

    // 持ち駒
    sfen += " ";
    if (piece_black.length + piece_white.length == 0){
        sfen += "-";
    }else{
        for (bc of piece_black){
            if(bc.piece_num > 1){
                sfen += bc.piece_num;
            } 
            sfen += bc.piece_type;
        }
        for (wc of piece_white){
            if(wc.piece_num > 1){
                sfen += wc.piece_num;
            }
            sfen += wc.piece_type;
        }
    }
    console.log(piece_black);
    console.log(piece_white);
    // 手数
    sfen += " ";
    sfen += ply;
    
    return sfen;
}