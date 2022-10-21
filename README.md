# Qhapaq-Shogi-Academy (QSA)
- QSAは棋力向上ソフトウエアです。タイムリープ式の対局と次の一手クイズの出力をすることができます。棋力向上に関する研究結果についてはこちらを参照してください。コンパイル済の実行ファイルが必要な方は[こちら](https://github.com/qhapaq-49/open-qsa/releases/tag/qsa-windows)からダウンロードしてください（一般的なwindowsであればインストールなど抜きで動かせるはずです）
- 開発者による実験では本ツールの利用でeloレーティング換算で200程度の棋力向上に成功しています（が、実験データ数が少ないのでモニターは常に募集しています！）
- マニュアルはバイナリに同梱されていますが[こちらから](https://github.com/qhapaq-49/open-qsa/tree/master/doc)も読めます
- このページでは開発者向けのコンパイル方法を紹介します

# How to build
ubuntuでのビルドを確認しています。Windowsでも恐らく動きますが保証はいたしかねます。pythonからのバイナリ作成では[Nuitka](https://github.com/Nuitka/Nuitka)を使っています。linuxでstandaloneのビルドをするには恐らくpatchelfが必要になります。詳しくは公式のドキュメントをご参照ください。

## 必要なsubmoduleの取得
    git submodule update --init --recursive
でやねうら王とopen-sekisyuのコードを取得してください。

## やねうら王のビルド
## やねうら王のコンパイル
    bash build_yaneuraou.sh
でやねうら王をコンパイルすることができます。やねうら王のバージョンはデフォルトではNNUE+tournament形式としています。

## Qhapaq-Shogi-Academy (electron app)のビルド
    bash build_qsa.sh
でQSAをコンパイルすることができます。sekisyuよりも先にコンパイルを行ってください。

## sekisyu-engineのビルド
- QSAの他にタイムリープ対局向けのやねうら王のwrapperエンジンをビルドする必要があります。wrapperエンジンはopen-sekisyuプロジェクトで開発されております。
    bash build_sekisyu.sh
で必要なファイルをコンパイルし、適切な場所に配置することができます。
