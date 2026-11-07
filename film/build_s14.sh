#!/bin/sh
# S14, "Where the thread goes next": opens on S11's exact last frame (the ivory world map), the
# ink settles, gold routes run from Kozhikode to Vienna, Ljubljana, Moscow and Bogota (routes.py),
# then the frame fades through white into the gold thread on ivory paper (tail of the S13 v2 take).
# Writes film/clips/S14.mp4, then the standard and HD site encodes.
# usage: sh film/build_s14.sh
set -e
cd "$(dirname "$0")/.."
TMP=$(mktemp -d)
N="scale=1920:1080:force_original_aspect_ratio=increase:flags=lanczos,crop=1920:1080,setsar=1,fps=24,format=yuv420p"
ffmpeg -v error -y -sseof -0.05 -i film/clips/S11.mp4 -frames:v 1 -update 1 -vf "scale=1920:1080:force_original_aspect_ratio=increase:flags=lanczos,crop=1920:1080" "$TMP/first.png"
ffmpeg -v error -y -i film/keyframes/K11_map.png -vf "scale=1920:1080:force_original_aspect_ratio=increase:flags=lanczos,crop=1920:1080" "$TMP/map.png"
python film/routes.py "$TMP/map.png" "$TMP/rt" 3.2 "$TMP/first.png"
ffmpeg -v error -y -framerate 24 -i "$TMP/rt/r_%04d.png" -ss 2.6 -i film/clips/v1/S13_v2_balance-to-ivory.mp4 -filter_complex \
  "[0]$N[a];[1]$N[b];[a][b]xfade=transition=fadewhite:duration=0.8:offset=2.4,format=yuv420p" \
  -an -c:v libx264 -preset slow -crf 12 film/clips/S14.mp4
rm -rf "$TMP"
sh film/encode.sh S14
sh film/encode_hd.sh S14
