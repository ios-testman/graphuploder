graphuploder(uploaderでなくて？）
============

人様のコードで確認
参考元（という名のまんま）：http://dev.ariel-networks.com/wp/archives/3888　https://github.com/kawanoshinobu/photo-sharing-app

現状のコードはmongooseで動くようにしている。

====================

要領削減のため、不要ファイルの削除。
参考元のカラー、名称を変更

====================

一口メモ　"Photo Sharing"という単語をカレントディレクトリ内のファイルの
中まで探索するコマンド
find . -type f -exec grep -q "Photo Sharing" {} \; -print

