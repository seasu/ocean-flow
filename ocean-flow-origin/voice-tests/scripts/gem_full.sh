# 用法：bash gem_full.sh Charon，再 FIT=1 PLAIN=1 python3 mix.py full_Charon out.mp3 1
v=$1; d=full_$v; mkdir -p $d
python3 -c "import json;json.dump([s for s,_ in json.load(open('/mnt/project-files/ocean-flow-origin/voice-tests/scripts/zh.json'))],open('$d/starts.json','w'))"
python3 -c "import json;[print(t) for _,t in json.load(open('/mnt/project-files/ocean-flow-origin/voice-tests/scripts/zh.json'))]" | { i=0; while read t; do i=$((i+1)); n=$(printf %02d $i); python3 /mnt/project-files/ocean-flow-origin/voice-tests/scripts/gem.py gemini-3.8-flash-tts $v "$(cat /mnt/project-files/ocean-flow-origin/voice-tests/scripts/gemini-elder-prompt.txt)" "$t" $d/s$n & done; wait; }
