// Modules to control application life and create native browser window
const {app, BrowserWindow, dialog, ipcRenderer} = require('electron')
const path = require('path')
const fs = require("fs")
const iconv = require('iconv-lite');
const encoding = require('encoding-japanese');

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    // width : 580, // 本番用ウィンドウ幅
    height: 770,
    webPreferences: {
      preload: path.join(__dirname, './preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableremotemodule: true,
    }
  })
 
  /*
  for (arg of process.argv){
    console.log(arg);
    if (arg == "cmd_mode"){
  */
      // 1秒置きによばれる関数
      // windows+electronはまさかのstdin非対応という糞仕様
      // なので中間ファイルを定期的に確認するというオワコン実装で対応する
      // 多分cpuに大変よろしくない
      // https://github.com/electron/electron/issues/4218
      console.log(process.argv);
      setInterval(()=>{
        mainWindow.webContents.send('interval')
      }, 1000);
  /*
    }
  }
  */
  
  // windows版のguiでは実行時にargをわたすことが出来ない？

  // and load the index.html of the app.
  mainWindow.loadFile('src/index.html')
 
  // Open the DevTools.
  mainWindow.webContents.openDevTools()
  // この行を追加する。
  mainWindow.setMenuBarVisibility(false);
  var reader = require("readline").createInterface({
    input: process.stdin,
  });
  reader.on("line", (line) => {

    mainWindow.webContents.send("stdin-vue", line);
    
    /*
    mainWindow.postMessage({
      "file" : line
    });
    */
  });

  
}
 
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()
  
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})
 
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
 
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

const { ipcMain } = require('electron');
ipcMain.handle('tomain-message-dialog', async (event, strtype, strtitle, strmessage) => {
    const { dialog } = require('electron');
    dialog.showMessageBoxSync(

            // win, // ここmain-processで生成したwindowを指定できる
            {
                type: strtype,
                buttons: ['OK'],
                title: strtitle,
                message: strmessage,
            });
});

ipcMain.handle('get_json_data', async (event, json_file) => {
  // jsonをloadする
  return JSON.parse(fs.readFileSync(json_file, 'utf8'));
});


ipcMain.handle('read_file', async (event, txt_file) => {
  // jsonをloadする
  if(fs.existsSync(txt_file)){
    binary =  fs.readFileSync(txt_file);
    enc = encoding.detect(binary);
    console.log(enc);
    if(enc == "SJIS"){
      return iconv.decode(binary, "Shift_JIS"); //作成したバッファを使い、iconv-liteでShift-jisからutf8に変換
    }
    return binary.toString('UTF-8')
    
  }
  return "file_not_found";
});

ipcMain.handle('check_last_modified', async (event, txt_file) => {
  if(fs.existsSync(txt_file)){
    const stats = fs.statSync(txt_file)
    return stats.mtimeMs
  }
  return "";
});


ipcMain.handle('save_json_data', async (event, json_path, json_data) => {
  
  fs.writeFileSync(json_path, json_data);
});


ipcMain.handle('save_dialog', async (event) => {
  let options = {
    title: 'タイトル',
    filters: [
        { name: 'json File', extensions: ['json']},
        { name: 'All Files', extensions: ['*'] }
    ]
  };
  let dpath = await dialog.showSaveDialog(null, options);
  return dpath;
});

const readdirRecursively = (dir, files = []) => {
  const dirents = fs.readdirSync(dir, { withFileTypes: true });
  const dirs = [];
  for (const dirent of dirents) {
    if (dirent.isDirectory()) dirs.push(`${dir}/${dirent.name}`);
    if (dirent.isFile()) files.push(`${dir}/${dirent.name}`);
  }
  for (const d of dirs) {
    files = readdirRecursively(d, files);
  }
  return files;
};

function select_json(dir){
  const qpaths_all = readdirRecursively(dir);
  const qpaths = qpaths_all.filter(file => file.endsWith(".json"));
  return qpaths
}

ipcMain.handle('get-file-dir', async (event, file_name) => {
  return path.dirname(file_name);
});

ipcMain.handle('select_json', async (event, json_path) => {
  return select_json(json_path);
});


ipcMain.handle('open-quiz-dir', async (event) => {

  let out = await dialog.showOpenDialog(null, {
    properties: ['openDirectory'],
    title: 'フォルダ選択',
  });
  if (!out["canceled"]){
    out["qpaths"] = await select_json(out["filePaths"][0]);
  }else{
    out["qpaths"] = [];
  }
  return out;
});


ipcMain.handle('open-file-list', async (event) => {

  let out = await dialog.showOpenDialog(null, {
    properties: ['openFile', 'multiSelections'],
    title: 'ファイルリストを選択',
    filters: [
      { name: 'All Files', extensions: ['*'] },
      { name: 'json File', extensions: ['json']},
      { name: 'kif File', extensions: ['kif']},
      { name: 'csa File', extensions: ['csa']},
    ]
  });
  return out;
});

ipcMain.handle('ask-yesno', async (event, txt) => {
  
  var options = {
      type: 'info',
      buttons: ['Yes', 'No'],
      title: 'Qhapaq Shogi Academy',
      message: '駒を成りますか？',
  };
  out = dialog.showMessageBox(options);
  return out;
});


ipcMain.handle('subprocess', async (event, cmd) => {
  const { execSync } = require('child_process')

  const stdout = execSync(cmd);
  return stdout.toString();
});



ipcMain.handle('prompt-show', async (event, contents) => {
  const path = require('path')
  const electron = require('electron')
  const BrowserWindow = electron.BrowserWindow
  const app = electron.app
  
  app.on('ready', function() {
    mainWindow = new BrowserWindow({ width: 300, height: 200 });
    mainWindow.loadURL('src/filter.html');
    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  });
});
