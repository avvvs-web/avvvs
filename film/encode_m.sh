#!/bin/sh
# Phone set: the centre of the HD master, cut to a 608x1080 portrait frame (what a phone held
# upright shows of a 16:9 frame under object-fit: cover anyway), with a keyframe every 3 frames
# and no B-frames, so each scroll seek decodes very little. Graded already (it is cut from hd/).
# usage: sh film/encode_m.sh s02   (or no argument for every clip)
set -e
cd "$(dirname "$0")/.."
mkdir -p web/public/media/film/m
for f in ${1:+web/public/media/film/hd/$1.mp4} ${1:-web/public/media/film/hd/*.mp4}; do
  [ -f "$f" ] || continue
  id=$(basename "$f" .mp4)
  ffmpeg -v error -y -i "$f" -an -vf "crop=608:1080" -c:v libx264 -preset slow -crf 24 -g 3 -bf 0 \
    -pix_fmt yuv420p -movflags +faststart "web/public/media/film/m/$id.mp4"
  echo "$id $(du -k "web/public/media/film/m/$id.mp4" | cut -f1) KB"
done
