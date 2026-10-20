# Mahidol University Sustainability Action Tracker

โค้ดใน `apps-script/` คือเว็บแอป Google Apps Script ที่เชื่อมกับ Google Sheet รหัส `1qB4mxGo4OOR2UuTOw5AJ0mbbHLEGaOgZX8Nal9g0LJk` โดยตรง รวมทั้งหน้าดูรายงานและหน้าบันทึกข้อมูล

เว็บแอปที่ใช้งานจริง: <https://script.google.com/a/macros/mahidol.ac.th/s/AKfycbwktgmYgRjStHCH6QBz4m-SU6q9sTuk4Up6lZEJBPX1Lc-lCXrhzUvs_jnjAFdtNESfkA/exec> (deployment เวอร์ชัน 3, 20 ต.ค. 2026) ส่วน URL ที่ขึ้นต้น `AKfycbzN5DwkM8fZ_` เป็น deployment เก่าที่ไม่ใช้งานแล้ว

## ดูหน้าตาจริงบนเครื่อง

ใช้ Node.js 18 ขึ้นไป แล้วรัน `node local-preview.cjs` จากโฟลเดอร์นี้ เปิด <http://127.0.0.1:4173/> หน้า localhost อ่านข้อมูลจริงจากชีต แต่ปิดการบันทึกและอัปโหลดไว้ การอ่านข้อมูลวิธีนี้ต้องให้ชีตอนุญาตการอ่านผ่านลิงก์สาธารณะ

รัน `node verify-project.cjs` เพื่อตรวจไฟล์ HTML, JavaScript, Apps Script และสิทธิ์แอดมินก่อนดีพลอย

## ดีพลอยเว็บแอปที่ใช้งานได้ครบ

1. เปิดโปรเจ็กต์ Google Apps Script ที่ต้องการใช้ และนำไฟล์ทั้งหมดใน `apps-script/` เข้าไป โดยรักษาชื่อไฟล์เดิม รวมถึง `appsscript.json` ใน Project Settings
2. ตรวจว่าเจ้าของการดีพลอยมีสิทธิ์แก้ไขชีตที่ระบุใน `Main.gs` และอนุญาตสิทธิ์ Spreadsheet/Drive ตามที่ Apps Script ขอ
3. เลือก **Deploy → New deployment → Web app** ให้รันในฐานะเจ้าของโปรเจ็กต์ และจำกัดผู้เข้าใช้ตามนโยบายของหน่วยงาน ก่อนกด Deploy
4. เปิด URL `/exec` ที่ได้ แล้วทดสอบแดชบอร์ด รายโครงการ และการบันทึกด้วยบัญชีทดสอบที่มีสิทธิ์

สิทธิ์แอดมินตรวจที่ฝั่งเซิร์ฟเวอร์ด้วย `Session.getActiveUser().getEmail()` หาก Apps Script ไม่ส่งอีเมลผู้ใช้ ฟังก์ชันแอดมินจะปฏิเสธการทำงาน โปรดตรวจพฤติกรรมนี้กับบัญชีจริงก่อนเปิดใช้งาน

## GitHub Pages สำหรับดูรายงาน

รัน `node build-pages.cjs` เพื่อสร้างเว็บใน `docs/` แล้วรัน `node pages-preview.cjs` เพื่อทดลองที่ <http://127.0.0.1:4174/> หน้าเว็บนี้อ่านข้อมูลล่าสุดจากชีตผ่าน Google Visualization โดยตรงเมื่อเปิดเว็บ แสดงแดชบอร์ด รายละเอียดโครงการ และตารางแผนเทียบผล แต่ไม่มีการบันทึกหรืออัปโหลด

ฟังก์ชันคำนวณรายงานใน `docs/backend-readonly.js` สร้างจากไฟล์ `.gs` ชุดเดียวกับ Apps Script ทุกครั้งที่รัน `node build-pages.cjs` หน้า GitHub จึงใช้สูตรคำนวณเดียวกัน ปุ่ม **บันทึก/แก้ไขข้อมูล** เปิดเว็บ Apps Script เดิมในแท็บใหม่ ซึ่งทำงานกับชีตและ Drive ในสิทธิ์ของ Google หลังบันทึกแล้วกลับมาที่ Pages และกด **รีเฟรชข้อมูล** การเปิดเว็บ Apps Script ต้องลงชื่อเข้าใช้ และโปรเจ็กต์นั้นต้องอัปเดตเป็นโค้ดชุดล่าสุดก่อนฟังก์ชันบันทึกจะใช้ได้

การเผยแพร่ใช้ GitHub repository นี้ โดยตั้งค่า **Settings → Pages → Build and deployment → Deploy from a branch → main → /docs → Save** URL ที่ได้คือ <https://sutanadsuy.github.io/Mahidol-University-Sustainability-Action-Tracker/> การอ่านข้อมูลบน Pages จะทำงานได้ตราบที่ Google Sheet อนุญาตให้ผู้เข้าชมอ่านข้อมูลผ่านลิงก์สาธารณะ

GitHub Pages ไม่สามารถรัน `.gs` หรือเขียนข้อมูลลง Sheets/Drive ได้ หากต้องการหน้าบันทึกข้อมูล ให้ใช้เว็บแอป Google Apps Script ด้านบน
