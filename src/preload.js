// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})

const { contextBridge, ipcRenderer, dialog} = require("electron");

      

contextBridge.exposeInMainWorld(
  "requires", {// <-- ここでつけた名前でひもづく。ここでは"window.requires"

    ipcRenderer : ipcRenderer,//ipcRendererも渡せるのでやり取りできる

    message_dialog: (strtype, strtitle, strmessage) => {

      ipcRenderer.invoke('tomain-message-dialog', strtype, strtitle, strmessage);
    },

    open_quiz_dir: () => {

      return ipcRenderer.invoke('open-quiz-dir');
    },

    ask_yesno: () => {

      return ipcRenderer.invoke('ask-yesno');
    },
    save_dialog: () => {
      return ipcRenderer.invoke('save_dialog');
    },
    open_file_list: () => {
      return ipcRenderer.invoke('open-file-list');
    },
    get_json_data : (json_path) => {
      return ipcRenderer.invoke('get_json_data', json_path);
    },
    read_file : (file_path) => {
      return ipcRenderer.invoke('read_file', file_path);
    },
    check_last_modified : (file_path) => {
      return ipcRenderer.invoke('check_last_modified', file_path);
    },
    save_json_data : (json_path, json_data) => {
      return ipcRenderer.invoke('save_json_data', json_path, json_data);
    },
    select_json : (json_path) => {
      return ipcRenderer.invoke('select_json', json_path);
    },
    get_file_dir : (file_name) => {
      return ipcRenderer.invoke('get-file-dir', file_name);
    },
    subprocess : (cmd) => {
      return ipcRenderer.invoke('subprocess', cmd);
    },
    prompt_show : (contents) =>{
      return ipcRenderer.invoke("prompt-show", contents);
    },
    // メイン → レンダラー
    on: (channel, callback) => ipcRenderer.on(channel, (event, argv)=>callback(event, argv))
  }
);