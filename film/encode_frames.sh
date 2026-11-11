#!/bin/sh
# The film as frame sequences: every device scrubs decoded stills on one canvas (FilmStage), so
# nothing depends on a browser's video decoder (seeks that stall, decoder limits, iOS power modes).
# Cut straight from the original clips with the site grade (greens pulled toward olive, gold untouched; the uruli oil warmed), every second frame
# (12 fps; FilmStage blends neighbouring frames, so slow moves stay smooth), plus each clip's very
# last frame so the joins between clips stay frame-exact. Three sets:
#   hd  1920x1080  large, sharp screens on a good connection
#   d   1280x720   laptops, tablets, slower connections
#   p    608x1080  phones held upright (the centre of the frame, which is all they show)
# Writes web/public/media/film/v2/<set>/<id>/f_001.webp ... and web/src/lib/film-frames.json.
# The folder is versioned (v2) because it is served with a one-year immutable cache: after
# re-encoding anything, bump V here, in FilmStage (FRAMES_BASE) and in next.config.ts.
# usage: sh film/encode_frames.sh            (all clips)   or   sh film/encode_frames.sh S05
set -e
cd "$(dirname "$0")/.."
V=v2
OUT=web/public/media/film/$V
BASE="scale=1920:1080:force_original_aspect_ratio=increase:flags=lanczos,crop=1920:1080,huesaturation=saturation=-0.55:colors=g+c:strength=60,eq=saturation=0.94"
WARM="hue=h=-10:s=1.15,colorbalance=rs=.06:gs=-.02:bs=-.10:rm=.06:bm=-.08,eq=gamma=0.95:contrast=1.06"
WEBP="-c:v libwebp -compression_level 6 -fps_mode passthrough"

# every second frame, and the last one
pick() { n=$(ffprobe -v error -select_streams v:0 -count_packets -show_entries stream=nb_read_packets -of csv=p=0 "$1" | tr -d '\r'); echo "select='not(mod(n\,2))+eq(n\,$((n - 1)))'"; }

one() {
  id=$1; lid=$(echo "$id" | tr 'S' 's'); src="film/clips/$id.mp4"
  for s in hd d p; do rm -rf "$OUT/$s/$lid"; mkdir -p "$OUT/$s/$lid"; done
  case "$id" in
    S09) k="clip((T-1)/4,0,1)" ;;      # warms as the uruli comes into view
    S10) k="clip((1.6-T)/1.2,0,1)" ;;  # back to the normal grade before the bottle
    *)   k="" ;;
  esac
  if [ -n "$k" ]; then g="[0]$BASE,format=gbrp,split[a][b];[b]$WARM,format=gbrp[w];[a][w]blend=all_expr='A*(1-($k))+B*($k)',format=yuv420p"
  else g="[0]$BASE"; fi
  ffmpeg -v error -y -i "$src" -an -filter_complex \
    "$g,$(pick "$src"),split=3[h][m][q];[m]scale=1280:720:flags=lanczos[m2];[q]crop=608:1080[q2]" \
    -map "[h]" $WEBP -quality 72 "$OUT/hd/$lid/f_%03d.webp" \
    -map "[m2]" $WEBP -quality 70 "$OUT/d/$lid/f_%03d.webp" \
    -map "[q2]" $WEBP -quality 72 "$OUT/p/$lid/f_%03d.webp"
  echo "$lid $(ls "$OUT/d/$lid" | wc -l | tr -d ' ') frames"
}

# the Blender thread shot is a 1280x720 render with its own grade: it is not scaled up in the
# file (the canvas scales it), and phones get its centre
thread() {
  src=film/clips/b4-thread.mp4; lid=b4-thread
  for s in hd d p; do rm -rf "$OUT/$s/$lid"; mkdir -p "$OUT/$s/$lid"; done
  ffmpeg -v error -y -i "$src" -an -filter_complex \
    "[0]$(pick "$src"),split=3[h][m][q];[q]crop=406:720[q2]" \
    -map "[h]" $WEBP -quality 78 "$OUT/hd/$lid/f_%03d.webp" \
    -map "[m]" $WEBP -quality 70 "$OUT/d/$lid/f_%03d.webp" \
    -map "[q2]" $WEBP -quality 74 "$OUT/p/$lid/f_%03d.webp"
  echo "$lid $(ls "$OUT/d/$lid" | wc -l | tr -d ' ') frames"
}

if [ -n "$1" ]; then
  if [ "$1" = "b4-thread" ]; then thread; else one "$1"; fi
else
  # four clips at a time
  for group in "S01 S02 S03 S04" "S05 S06 S07 S09" "S10 S11 S14 b4-thread"; do
    for id in $group; do if [ "$id" = "b4-thread" ]; then thread & else one "$id" & fi; done
    wait
  done
fi

json="{"
for d in "$OUT"/d/*/; do id=$(basename "$d"); json="$json\"$id\":$(ls "$d" | wc -l | tr -d ' '),"; done
echo "${json%,}}" > web/src/lib/film-frames.json
cat web/src/lib/film-frames.json; echo
du -sh "$OUT"/hd "$OUT"/d "$OUT"/p
