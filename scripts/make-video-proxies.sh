#!/usr/bin/env bash
# Make small working copies of every Dome video, so they can be catalogued and cut
# without moving the originals. Runs on the Mac, against the Google Drive folder.
#
# Originals are never touched: they are only read. Everything this writes goes to
#   <Media>/Proxies/<same folder name>/<same file name>-proxy.mp4   (1280 wide, H.264, small)
#   <Media>/Proxies/<same folder name>/<same file name>-sheet.jpg   (12 frames on one image, timed)
#   <Media>/Proxies/<same folder name>/<same file name>.json        (duration, size, frame rate, date)
# A file that already has a proxy is skipped, so the script can be stopped and run again.
#
# Needs: ffmpeg (brew install ffmpeg)
# Usage: scripts/make-video-proxies.sh ["/path/to/The Dome/Media"]

set -uo pipefail
MEDIA="${1:-$HOME/Library/CloudStorage/GoogleDrive-ashreys@gmail.com/My Drive/The Dome/Media}"
OUT="$MEDIA/Proxies"
FOLDERS=("Drone Raw Files" "Video Clips Raw Files" "EDITS")
command -v ffmpeg >/dev/null || { echo "ffmpeg is missing: brew install ffmpeg"; exit 1; }
[ -d "$MEDIA" ] || { echo "Media folder not found: $MEDIA"; exit 1; }

log="$OUT/_log.txt"; mkdir -p "$OUT"; : >> "$log"
total=0; done_n=0; failed=0
for f in "${FOLDERS[@]}"; do total=$((total + $(find "$MEDIA/$f" -maxdepth 1 -type f \( -iname '*.mp4' -o -iname '*.mov' \) | wc -l))); done
echo "$(date '+%F %T') start: $total videos" | tee -a "$log"

for folder in "${FOLDERS[@]}"; do
  src="$MEDIA/$folder"; dst="$OUT/$folder"; mkdir -p "$dst"
  # oldest name first keeps each drone flight together
  find "$src" -maxdepth 1 -type f \( -iname '*.mp4' -o -iname '*.mov' \) -print0 | sort -z | while IFS= read -r -d '' v; do
    name="$(basename "$v")"; stem="${name%.*}"; done_n=$((done_n + 1))
    if [ -s "$dst/$stem-proxy.mp4" ] && [ -s "$dst/$stem-sheet.jpg" ]; then continue; fi
    echo "[$folder] $name" | tee -a "$log"

    # 1. facts (reading the file makes Drive download it; it stays in Drive's cache)
    ffprobe -v error -print_format json -show_format -show_streams "$v" > "$dst/$stem.json" 2>>"$log"
    dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$v" 2>/dev/null)
    dur=$(awk -v d="${dur:-1}" 'BEGIN { printf "%.3f", (d + 0 < 0.5 ? 0.5 : d * 1.02) }')   # a touch long, so the 12th frame lands

    # 2. the proxy: 1280 wide (phones keep their upright shape), 30 fps, H.264, quick to scrub
    #    drone clips have no useful sound; phone clips keep theirs, quietly compressed
    audio=(-an); [ "$folder" != "Drone Raw Files" ] && audio=(-c:a aac -b:a 96k -ac 2)
    if ! ffmpeg -nostdin -v error -y -hwaccel videotoolbox -i "$v" \
        -vf "scale='if(gt(iw,ih),1280,-2)':'if(gt(iw,ih),-2,1280)',fps=30,format=yuv420p" \
        -c:v libx264 -preset veryfast -crf 26 -g 30 -movflags +faststart "${audio[@]}" \
        "$dst/$stem-proxy.mp4" 2>>"$log"; then
      # some files dislike hardware decoding: try once more without it
      ffmpeg -nostdin -v error -y -i "$v" \
        -vf "scale='if(gt(iw,ih),1280,-2)':'if(gt(iw,ih),-2,1280)',fps=30,format=yuv420p" \
        -c:v libx264 -preset veryfast -crf 26 -g 30 -movflags +faststart "${audio[@]}" \
        "$dst/$stem-proxy.mp4" 2>>"$log" || { echo "  FAILED: $name" | tee -a "$log"; failed=$((failed + 1)); continue; }
    fi

    # 3. the sheet: 12 evenly spaced frames, each stamped with its time, from the proxy (fast)
    ffmpeg -nostdin -v error -y -i "$dst/$stem-proxy.mp4" \
      -vf "fps=12/$dur,scale=320:-2,drawtext=text='%{pts\\:hms}':x=6:y=6:fontsize=16:fontcolor=white:box=1:boxcolor=black@0.5,tile=4x3:padding=4:color=black" \
      -frames:v 1 -q:v 4 "$dst/$stem-sheet.jpg" 2>>"$log" \
    || ffmpeg -nostdin -v error -y -i "$dst/$stem-proxy.mp4" -vf "fps=12/$dur,scale=320:-2,tile=4x3:padding=4" -frames:v 1 -q:v 4 "$dst/$stem-sheet.jpg" 2>>"$log"

    echo "  ok  $(du -h "$dst/$stem-proxy.mp4" | cut -f1)" | tee -a "$log"
  done
done
echo "$(date '+%F %T') finished" | tee -a "$log"
du -sh "$OUT" | tee -a "$log"
