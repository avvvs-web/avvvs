#!/bin/sh
# Join every finished clip, in film order, into one preview reel (720p) to review the joins.
# Missing clips are skipped. Output: film/preview_reel.mp4
set -e
cd "$(dirname "$0")/.."
list=film/_reel.txt; : > $list
for c in web/public/media/film/s01.mp4 web/public/media/film/s02.mp4 web/public/media/film/s03.mp4 web/public/media/film/s04.mp4 web/public/media/film/s05.mp4 web/public/media/film/s06.mp4 web/public/media/film/s07.mp4 web/public/media/b4-thread.mp4 web/public/media/film/s09.mp4 web/public/media/film/s10.mp4 web/public/media/film/s11.mp4 web/public/media/film/s14.mp4; do
  [ -f "$c" ] || continue
  o="film/_r_$(basename $c)"
  ffmpeg -v error -y -i "$c" -an -vf "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,fps=24,setsar=1" -c:v libx264 -crf 22 -pix_fmt yuv420p "$o"
  echo "file '$(basename $o)'" >> $list
done
(cd film && ffmpeg -v error -y -f concat -safe 0 -i _reel.txt -c copy preview_reel.mp4)
rm -f film/_r_*.mp4 $list
ffprobe -v error -show_entries format=duration -of csv=p=0 film/preview_reel.mp4
