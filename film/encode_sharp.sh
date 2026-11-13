#!/bin/sh
# The film's two sharp frame sets, for screens with more pixels than the 1080p clips have:
#   uhd  2560x1440  large high-density screens (Retina laptops, 4K monitors) on a good connection
#   p2   1080x1920  phones with dense screens (the centre of the frame, as in the p set)
# Same cut and grade as encode_frames.sh, at the size the screen shows, so the browser does not
# have to stretch a smaller frame (which is what looks soft).
# FilmStage picks these when the screen and the connection can take them, and falls back to hd / p.
# The factory beat (folder "standard") is drawn at these sizes by film/factory/render.mjs.
# Writes web/public/media/film/v3/{uhd-v3,p2-v3}/<id>/f_001.webp ...
# usage: sh film/encode_sharp.sh            (all clips)   or   sh film/encode_sharp.sh S05
set -e
cd "$(dirname "$0")/.."
V=v3
OUT=web/public/media/film/$V
U=uhd-v3; Q=p2-v3   # the folders: bump the suffix (here and in FilmStage's SETS, render.mjs) after re-encoding
GRADE="huesaturation=saturation=-0.55:colors=g+c:strength=60,eq=saturation=0.94"
WARM="hue=h=-10:s=1.15,colorbalance=rs=.06:gs=-.02:bs=-.10:rm=.06:bm=-.08,eq=gamma=0.95:contrast=1.06"
WEBP="-c:v libwebp -compression_level 6 -fps_mode passthrough"

# A clip that has been through the AI upscaler (film/clips/up/<ID>.mp4, 1440p, made with Higgsfield's
# Bytedance video upscale, preset aigc) is used as it is with a light sharpen; one that has not is
# enlarged with Lanczos from the 1080p original and sharpened harder.
one() {
  id=$1; lid=$(echo "$id" | tr 'S' 's')
  if [ -f "film/clips/up/$id.mp4" ]; then src="film/clips/up/$id.mp4"; sharp="cas=0.3"
  else src="film/clips/$id.mp4"; sharp="unsharp=5:5:0.55:5:5:0,cas=0.6"; fi
  for s in $U $Q; do rm -rf "$OUT/$s/$lid"; mkdir -p "$OUT/$s/$lid"; done
  case "$id" in
    S09) k="clip((T-1)/4,0,1)" ;;
    S10) k="clip((1.6-T)/1.2,0,1)" ;;
    *)   k="" ;;
  esac
  base="scale=2560:1440:force_original_aspect_ratio=increase:flags=lanczos,crop=2560:1440,$GRADE"
  if [ -n "$k" ]; then g="[0]$base,format=gbrp,split[a][b];[b]$WARM,format=gbrp[w];[a][w]blend=all_expr='A*(1-($k))+B*($k)',format=yuv420p"
  else g="[0]$base"; fi
  ffmpeg -v error -y -i "$src" -an -filter_complex     "$g,split=2[u][q];[u]$sharp[u2];[q]crop=810:1440,scale=1080:1920:flags=lanczos,$sharp[q2]"     -map "[u2]" $WEBP -quality 76 "$OUT/$U/$lid/f_%03d.webp"     -map "[q2]" $WEBP -quality 78 "$OUT/$Q/$lid/f_%03d.webp"
  echo "$lid $(ls "$OUT/$U/$lid" | wc -l | tr -d ' ') frames from $src"
}

# the thread shot is a Blender render: its 1440p frames (blender/golden_thread.py, mode final,
# frames 25-216, which is the film's cut) are used as they are; without them the 720p clip is enlarged
thread() {
  lid=b4-thread
  for s in $U $Q; do rm -rf "$OUT/$s/$lid"; mkdir -p "$OUT/$s/$lid"; done
  if [ -f blender/renders/final/f_0216.png ]; then
    ffmpeg -v error -y -framerate 24 -start_number 25 -i blender/renders/final/f_%04d.png -an -filter_complex       "[0]format=yuv420p,split=2[u][q];[q]crop=810:1440,scale=1080:1920:flags=lanczos[q2]"       -map "[u]" $WEBP -quality 82 "$OUT/$U/$lid/f_%03d.webp"       -map "[q2]" $WEBP -quality 82 "$OUT/$Q/$lid/f_%03d.webp"
  else
    sharp="unsharp=5:5:0.55:5:5:0,cas=0.6"
    ffmpeg -v error -y -i film/clips/b4-thread.mp4 -an -filter_complex       "[0]split=2[u][q];[u]scale=2560:1440:flags=lanczos,$sharp[u2];[q]crop=406:720,scale=1080:1920:flags=lanczos,$sharp[q2]"       -map "[u2]" $WEBP -quality 80 "$OUT/$U/$lid/f_%03d.webp"       -map "[q2]" $WEBP -quality 80 "$OUT/$Q/$lid/f_%03d.webp"
  fi
  echo "$lid $(ls "$OUT/$U/$lid" | wc -l | tr -d ' ') frames"
}

if [ -n "$1" ]; then
  if [ "$1" = "b4-thread" ]; then thread; else one "$1"; fi
else
  for group in "S01 S02 S03" "S04 S05 S06" "S07 S09 S10" "S14 b4-thread"; do
    for id in $group; do if [ "$id" = "b4-thread" ]; then thread & else one "$id" & fi; done
    wait
  done
fi
du -sh "$OUT/$U" "$OUT/$Q"
