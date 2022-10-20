# やねうら王のビルド
# TODO : clang
echo "build yaneuraou"
cd YaneuraOu/source
make tournament -j8
mv YaneuraOu-by-gcc ../../release/YaneuraOu-by-gcc.exe
cd ../../
