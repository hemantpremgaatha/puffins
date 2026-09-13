#!/bin/bash
set -e
cd "/d/Parth bana"
FF="/c/KMPlayer/ffmpeg.exe"
W=1080
H=1920
FPS=30
DUR=2.6

VF="scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},fps=${FPS},format=yuv420p"

idx=0
list="reel_build/clips/concat_list.txt"
> "$list"

encode_photo() {
  f="$1"
  out=$(printf "%03d.mp4" "$idx")
  "$FF" -y -loop 1 -i "$f" -t "$DUR" -vf "$VF" -an -c:v libx264 -pix_fmt yuv420p -r "$FPS" "reel_build/clips/$out" -loglevel error
  echo "file '$out'" >> "$list"
  idx=$((idx+1))
}

encode_photo "WhatsApp Image 2026-09-02 at 10.16.41 PM.jpeg"
encode_photo "site/assets/img/brand/showcase-poster.jpg"
encode_photo "site/assets/img/brand/packshot-sea-salt.jpg"
encode_photo "site/assets/img/brand/topped-four-ways.webp"
encode_photo "site/assets/img/brand/lifestyle-topped-egg-prosciutto.jpg"
encode_photo "WhatsApp Image 2026-09-02 at 10.16.52 PM.jpeg"
encode_photo "WhatsApp Image 2026-09-02 at 10.16.44 PM.jpeg"
encode_photo "site/assets/img/brand/logo-lockup-wide.png"

echo "Encoded $idx clips"

(cd reel_build/clips && "$FF" -y -f concat -safe 0 -i concat_list.txt -c copy ../puffins_reel_silent.mp4 -loglevel error)
echo "Concat done"
