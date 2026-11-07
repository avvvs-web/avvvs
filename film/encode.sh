#!/bin/sh
# Encode a film clip for scroll-scrubbing on the site: dense keyframes (every 4 frames, no B-frames)
# so seeking to any scroll position is quick, faststart, no audio, 1600x900 (about 4 MB per 10 s).
# Grade: greens pulled toward olive (the bible: no green in the grade), gold untouched.
# usage: sh film/encode.sh S02   (reads film/clips/S02.mp4, writes web/public/media/film/s02.mp4 + poster)
set -e
cd "$(dirname "$0")/.."
id=$(echo "$1" | tr 'S' 's')
ffmpeg -v error -y -i "film/clips/$1.mp4" -an -vf "scale=1600:900:force_original_aspect_ratio=increase,crop=1600:900,huesaturation=saturation=-0.55:colors=g+c:strength=60,eq=saturation=0.94" \
  -c:v libx264 -preset slow -crf 27 -g 6 -bf 0 -pix_fmt yuv420p -movflags +faststart "web/public/media/film/$id.mp4"
echo "$id $(du -k "web/public/media/film/$id.mp4" | cut -f1) KB"
