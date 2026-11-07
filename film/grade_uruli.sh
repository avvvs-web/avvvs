#!/bin/sh
# The uruli oil reads olive-gold out of Kling; the client wants a golden-brown oil. This warms it,
# ramping the extra grade in and out so the joins either side stay frame-identical:
#   S09: normal grade at 0 s (matches the Blender clip's last frame), full warm from 5 s to the end
#   S10: full warm at 0 s (matches S09's last frame), back to normal by 1.6 s (before the bottle slides in,
#        so the end still matches S11)
# usage: sh film/grade_uruli.sh   (reads film/clips/S09.mp4 and S10.mp4, writes web/public/media/film/)
set -e
cd "$(dirname "$0")/.."
BASE="scale=1600:900:force_original_aspect_ratio=increase,crop=1600:900,huesaturation=saturation=-0.55:colors=g+c:strength=60,eq=saturation=0.94"
WARM="hue=h=-10:s=1.15,colorbalance=rs=.06:gs=-.02:bs=-.10:rm=.06:bm=-.08,eq=gamma=0.95:contrast=1.06"
ENC="-c:v libx264 -preset slow -crf 27 -g 6 -bf 0 -pix_fmt yuv420p -movflags +faststart"

# k = how much of the warm grade is mixed in at time T
grade() { # $1 clip id, $2 output name, $3 expression for k(T)
  ffmpeg -v error -y -i "film/clips/$1.mp4" -an -filter_complex \
    "[0]$BASE,format=gbrp,split[a][b];[b]$WARM,format=gbrp[w];[a][w]blend=all_expr='A*(1-($3))+B*($3)'" \
    $ENC "web/public/media/film/$2.mp4"
  echo "$2 $(du -k "web/public/media/film/$2.mp4" | cut -f1) KB"
}
grade S09 s09 "clip((T-1)/4,0,1)"
grade S10 s10 "clip((1.6-T)/1.2,0,1)"
