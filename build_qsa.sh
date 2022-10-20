rm -r release/qsa
rm -r dist
rm -r ~/.cache/electron/

npm install

# ここをOSに応じて弄る
# TODO : for mac
npx electron-builder --linux --x64 --dir # linux
# npx electron-builder --win --x64 --dir # win
# npx electron-builder --mac --x64 --dir # mac?

# ここのフォルダ名もOSに応じて弄る
# TODO : for mac
cp -r dist/linux-unpacked release/qsa # linux
# cp -r dist/win-unpacked ../qsa # win
# cp -r dist/mac ../qsa # mac?

mv release/qsa/qhapaq-shogi-academy release/qsa/Qhapaq-Shogi-Academy.exe # linux
# mv ../qsa/Qhapaq-Shogi-Academy.app ../qsa/Qhapaq-Shogi-Academy.exe # mac?
# windowではそもそもバイナリはQhapaq-Shogi-Academy.exeになってる様子

