#!/bin/bash
cd "$(dirname "$0")" || exit 1
if command -v node >/dev/null 2>&1; then
  node server.cjs &
elif command -v python3 >/dev/null 2>&1; then
  python3 -m http.server 4180 --bind 127.0.0.1 &
else
  echo "ต้องมี Node.js หรือ Python 3 ก่อนเปิดเว็บจำลอง"
  read -r -p "กด Enter เพื่อปิดหน้าต่าง..."
  exit 1
fi
server_pid=$!
sleep 1
open 'http://127.0.0.1:4180/starter.html'
echo 'เปิดเว็บจำลองแล้ว กรุณาเปิดหน้าต่างนี้ค้างไว้'
wait "$server_pid"
