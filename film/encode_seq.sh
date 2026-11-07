#!/bin/sh
# Phone frame sequences: Android's video decoders reset on every seek, so scroll-scrubbing a video
# stutters there however light it is. Phones scrub these stills on a canvas instead.
# Cut from the portrait phone set (m/, already graded): 540x960, 12 fps, WebP. Writes
# web/public/media/film/seq/<id>/f_001.webp ... and the frame counts to web/src/lib/film-seq.json.
# usage: sh film/encode_seq.sh
set -e
cd "$(dirname "$0")/.."
out=web/public/media/film/seq
rm -rf "$out" && mkdir -p "$out"
json="{"
for f in web/public/media/film/m/*.mp4; do
  id=$(basename "$f" .mp4)
  mkdir -p "$out/$id"
  ffmpeg -v error -y -i "$f" -vf "fps=12,scale=540:960:flags=lanczos" -c:v libwebp -quality 60 -compression_level 6 "$out/$id/f_%03d.webp"
  n=$(ls "$out/$id" | wc -l | tr -d ' ')
  json="$json\"$id\":$n,"
  echo "$id $n frames $(du -sk "$out/$id" | cut -f1) KB"
done
# the Blender thread shot lives outside film/ (1280x720): cut its centre to portrait the same way
f=web/public/media/b4-thread.mp4; id=b4-thread
mkdir -p "$out/$id"
ffmpeg -v error -y -i "$f" -vf "crop=ih*9/16:ih,fps=12,scale=540:960:flags=lanczos" -c:v libwebp -quality 60 -compression_level 6 "$out/$id/f_%03d.webp"
n=$(ls "$out/$id" | wc -l | tr -d ' ')
json="$json\"$id\":$n,"
echo "$id $n frames $(du -sk "$out/$id" | cut -f1) KB"
echo "${json%,}}" > web/src/lib/film-seq.json
du -sh "$out"
