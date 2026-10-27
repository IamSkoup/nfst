#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.."
ffmpeg -y -hide_banner -loglevel error -f lavfi -i 'anoisesrc=color=pink:sample_rate=44100:duration=4:seed=721' -af 'highpass=f=1600,lowpass=f=10500,volume=1.4,alimiter=limit=0.7' -c:a libvorbis -q:a 5 assets/audio/sfx/adrenaline-hiss.ogg
ffmpeg -y -hide_banner -loglevel error -f lavfi -i 'anoisesrc=color=white:sample_rate=44100:duration=0.55:seed=321' -af 'highpass=f=2200,lowpass=f=10000,volume=0.26,afade=t=in:st=0:d=0.012,afade=t=out:st=0.08:d=0.47' -c:a libvorbis -q:a 5 assets/audio/sfx/adrenaline-release.ogg
