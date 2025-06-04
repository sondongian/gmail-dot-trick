/**
 * worker.js
 * 
 * Web Worker để sinh tất cả tổ hợp “dot trick” mà không làm đơ UI chính.
 * Nhận postMessage từ main script: { base: "username", domains: ["gmail.com", "googlemail.com", ...] }
 * Gửi về hai loại message:
 *   1. { progress: <số nguyên 0–100> } – cập nhật % đã xong
 *   2. { progress: 100, emails: [mảng tất cả email] }
 */

self.addEventListener("message", (event) => {
  const data = event.data;
  const base = data.base;           // Ví dụ: "abcdxyz12edsda2dadsad"
  const domains = data.domains;     // Ví dụ: ["gmail.com", "googlemail.com"]
  const chars = base.split("");
  const n = chars.length;
  const spots = n - 1;              // số vị trí giữa các kí tự để chèn dot
  const totalMasks = 1 << spots;    // 2^(n-1)
  const emails = [];                // mảng chứa kết quả

  // Chia nhỏ tiến độ theo CHUNK để send progress thường xuyên
  const CHUNK = 50000; // cứ mỗi 50.000 (mask), gửi progress một lần

  for (let mask = 0; mask < totalMasks; mask++) {
    let temp = "";
    for (let i = 0; i < spots; i++) {
      temp += chars[i];
      if (((mask >> i) & 1) === 1) {
        temp += ".";
      }
    }
    temp += chars[n - 1];
    // Với mỗi domain, push email tương ứng
    for (const dom of domains) {
      emails.push(temp + "@" + dom);
    }

    // Gửi progress mỗi CHUNK
    if (mask % CHUNK === 0) {
      const pct = Math.round((mask / totalMasks) * 100);
      self.postMessage({ progress: pct });
    }
  }

  // Sau cùng, báo 100% và gửi mảng emails
  self.postMessage({ progress: 100, emails: emails });
});
