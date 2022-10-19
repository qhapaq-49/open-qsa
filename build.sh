rm -r ~/.cache/electron/

npm install

# ここをOSに応じて弄る
# TODO : for mac
npx electron-builder --linux --x64 --dir # linux
# npx electron-builder --win --x64 --dir # win
# npx electron-builder --mac --x64 --dir # mac?

# ここのフォルダ名もOSに応じて弄る
# TODO : for mac
cp -r dist/linux-unpacked ../qsa # linux
# cp -r dist/win-unpacked ../qsa # win
# cp -r dist/mac ../qsa # mac?

