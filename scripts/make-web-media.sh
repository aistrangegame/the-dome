#!/usr/bin/env bash
# Makes web copies of everything in media/ into site/assets/media/. Never touches the originals.
# Needs: ImageMagick (magick) for photos, ffmpeg for video.
set -euo pipefail
SRC="${1:-media}"
OUT="${2:-site/assets/media}"
mkdir -p "$OUT"
shopt -s nullglob nocaseglob globstar
for f in "$SRC"/**/*.{jpg,jpeg,png,heic} "$SRC"/*.{jpg,jpeg,png,heic}; do
  [ -f "$f" ] || continue
  base="$(basename "${f%.*}")"
  for w in 1600 800 400; do
    t="$OUT/$base-$w.webp"
    [ -f "$t" ] || magick "$f" -auto-orient -resize "${w}x${w}>" -quality 80 "$t"
  done
done
for f in "$SRC"/**/*.{mov,mp4} "$SRC"/*.{mov,mp4}; do
  [ -f "$f" ] || continue
  base="$(basename "${f%.*}")"
  for h in 1080 720; do
    t="$OUT/$base-$h.mp4"
    [ -f "$t" ] || ffmpeg -nostdin -loglevel error -i "$f" -vf "scale=-2:'min($h,ih)'" \
      -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -movflags +faststart -an "$t"
  done
  p="$OUT/$base-poster.webp"
  [ -f "$p" ] || ffmpeg -nostdin -loglevel error -ss 1 -i "$f" -frames:v 1 -vf "scale=1600:-2" "$p"
done
echo "Web copies in $OUT"
