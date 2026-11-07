#!/bin/sh
# Download a finished Kling clip, encode it for the site, and make a half-second audit strip
# (film/audit/<id>.jpg: one frame per 0.5 s, left to right) to check for AI fumbles.
# usage: sh film/fetch.sh S03 <result_url>
set -e
cd "$(dirname "$0")/.."
mkdir -p film/audit
curl -s -o "film/clips/$1.mp4" "$2"
ffmpeg -v error -y -i "film/clips/$1.mp4" -vf "fps=2,scale=256:-2,tile=10x2:padding=2:color=0x333333" -frames:v 1 -q:v 4 "film/audit/$1.jpg"
sh film/encode.sh "$1"
