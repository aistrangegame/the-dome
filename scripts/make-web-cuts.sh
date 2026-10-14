#!/usr/bin/env bash
# Cut the site's film clips from the full-quality drone originals. Runs on the Mac.
# Reads originals only; writes to <Media>/Web Cuts/. Each cut becomes:
#   NAME-l.mp4 / NAME-l.webm / NAME-l.webp   wide (1920x1080 for loops, 1280x720 for scroll clips)
#   NAME-p.mp4 / NAME-p.webm / NAME-p.webp   upright for phones (720x1280 loops, 600x1066 scroll clips)
# Loops fade in and out and play on their own; scroll clips are played by the page as you scroll,
# so they get short keyframe spacing (smooth scrubbing) and can be reversed.
#
# Needs: ffmpeg with libx264, libvpx-vp9 and libwebp (the Homebrew ffmpeg has all three).
# Usage: scripts/make-web-cuts.sh ["/path/to/The Dome/Media"]   (edit the CUTS list below)

set -uo pipefail
MEDIA="${1:-$HOME/Library/CloudStorage/GoogleDrive-ashreys@gmail.com/My Drive/The Dome/Media}"
SRC="$MEDIA/Drone Raw Files"
OUT="$MEDIA/Web Cuts"
mkdir -p "$OUT"

# name | source file | start (s) | length (s, or "end") | where the wide crop sits (0 top .. 1 bottom) | loop or scroll | reverse? | extra filter
CUTS=(
  "rise|DJI_20260801165035_0293_D.MP4|0|end|0.45|scroll|reverse|"
  "pool|DJI_20260801165035_0293_D.MP4|0|6.5|0.40|loop|no|"
  "night|DJI_20260731224041_0230_D.MP4|0|14|0.46|loop|no|eq=gamma=1.35:brightness=0.02"
)

for row in "${CUTS[@]}"; do
  IFS='|' read -r name file start len ycrop mode rev extra <<< "$row"
  in="$SRC/$file"; [ -f "$in" ] || { echo "missing: $file"; continue; }
  total=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$in")
  [ "$len" = "end" ] && len=$(awk -v t="$total" -v s="$start" 'BEGIN { printf "%.2f", t - s }')
  x=""; [ -n "$extra" ] && x=",$extra"
  r=""; [ "$rev" = "reverse" ] && r=",reverse"
  echo "== $name: $file from ${start}s for ${len}s ($mode)"

  # the originals are upright 2160x3840 once rotated; the wide version is a 16:9 band of that
  wide="crop=iw:iw*9/16:0:(ih-iw*9/16)*$ycrop"
  if [ "$mode" = "scroll" ]; then
    L="$wide,scale=1280:720$x,fps=15$r,format=yuv420p";  P="scale=600:-2,crop=600:1066$x,fps=15$r,format=yuv420p"
    H264=(-c:v libx264 -preset slow -crf 30 -g 6 -bf 0); VP9=(-c:v libvpx-vp9 -b:v 0 -crf 40 -g 6 -row-mt 1 -deadline good -cpu-used 4)
  else
    fo=$(awk -v l="$len" 'BEGIN { printf "%.2f", l - 0.6 }')
    fade=",fade=in:st=0:d=0.6,fade=out:st=$fo:d=0.6"
    L="$wide,scale=1920:1080$x,fps=24,format=yuv420p$fade";  P="scale=720:-2,crop=720:1280$x,fps=24,format=yuv420p$fade"
    H264=(-c:v libx264 -preset slow -crf 26); VP9=(-c:v libvpx-vp9 -b:v 0 -crf 38 -row-mt 1 -deadline good -cpu-used 4)
  fi
  for o in l p; do
    vf=$L; [ $o = p ] && vf=$P
    ffmpeg -nostdin -v error -y -ss "$start" -t "$len" -i "$in" -vf "$vf" "${H264[@]}" -an -movflags +faststart "$OUT/$name-$o.mp4" || echo "  FAILED $name-$o.mp4"
    ffmpeg -nostdin -v error -y -i "$OUT/$name-$o.mp4" "${VP9[@]}" -an "$OUT/$name-$o.webm" || echo "  FAILED $name-$o.webm"
    # the still that shows before the film plays (and instead of it, for reduced motion)
    ffmpeg -nostdin -v error -y -ss 0.8 -i "$OUT/$name-$o.mp4" -frames:v 1 -c:v libwebp -quality 78 "$OUT/$name-$o.webp" \
      || ffmpeg -nostdin -v error -y -i "$OUT/$name-$o.mp4" -frames:v 1 -c:v libwebp -quality 78 "$OUT/$name-$o.webp" || echo "  FAILED $name-$o.webp"
  done
  ls -lh "$OUT"/"$name"-* | awk '{print "  " $5 "  " $9}'
done
echo "done"
