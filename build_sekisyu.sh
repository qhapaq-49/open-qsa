echo "build sekisyu"

pip install pyyaml python-shogi dacite ordered-set

export PYTHONPATH=`pwd`/open-sekisyu

cp question_cmd_config.yaml release/qsa
cp config.yaml release

cd open-sekisyu/cui-engine/usi_engine
python -m nuitka --onefile --standalone --nofollow-import-to=matplotlib --nofollow-import-to=pandas --nofollow-import-to=numpy win_usi_engine_main.py
mv ./win_usi_engine_main.bin ../../../release/win_usi_engine_main.exe

cd ../question_generator
 python -m nuitka --onefile --standalone --nofollow-import-to=matplotlib --nofollow-import-to=pandas --nofollow-import-to=numpy question_cmd_withconf.py

mv ./question_cmd_withconf.bin ../../../release/qsa/question_cmd_withconf.exe
