#!/bin/sh
# High-definition copies of the film for large screens: full 1920x1080 from the original Kling
# clips, at higher quality (CRF 22, x264 film tuning) than the standard 1600x900 / CRF 27 set.
# Same grade as encode.sh (and the uruli warm ramp from grade_uruli.sh), same dense keyframes
# for scroll scrubbing. FilmStage picks these on wide, high-density screens with a good connection.
# usage: sh film/encode_hd.sh            (all clips)   or   sh film/encode_hd.sh S05   (one)
set -e
cd "$(dirname "$0")/.."
OUT=web/public/media/film/hd
mkdir -p "$OUT"
BASE="scale=1920:1080:force_original_aspect_ratio=increase:flags=lanczos,crop=1920:1080,huesaturation=saturation=-0.55:colors=g+c:strength=60,eq=saturation=0.94"
WARM="hue=h=-10:s=1.15,colorbalance=rs=.06:gs=-.02:bs=-.10:rm=.06:bm=-.08,eq=gamma=0.95:contrast=1.06"
ENC="-c:v libx264 -preset slow -crf 22 -tune film -g 6 -bf 0 -pix_fmt yuv420p -movflags +faststart"

one() {
  id=$1; out="$OUT/$(echo "$id" | tr 'S' 's').mp4"
  case "$id" in
    S09) k="clip((T-1)/4,0,1)" ;;      # warms as the uruli comes into view
    S10) k="clip((1.6-T)/1.2,0,1)" ;;  # back to the normal grade before the bottle
    *)   k="" ;;
  esac
  if [ -n "$k" ]; then
    ffmpeg -v error -y -i "film/clips/$id.mp4" -an -filter_complex \
      "[0]$BASE,format=gbrp,split[a][b];[b]$WARM,format=gbrp[w];[a][w]blend=all_expr='A*(1-($k))+B*($k)'" $ENC "$out"
  else
    ffmpeg -v error -y -i "film/clips/$id.mp4" -an -vf "$BASE" $ENC "$out"
  fi
  echo "$out $(du -k "$out" | cut -f1) KB"
}

if [ -n "$1" ]; then one "$1"; else for id in S01 S02 S03 S04 S05 S06 S07 S09 S10 S11 S14; do one $id; done; fi
