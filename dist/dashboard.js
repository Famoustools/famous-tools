var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { apiCall } from "./api.js";
// ตรวจสอบ Login
const token = localStorage.getItem("token");
const username = localStorage.getItem("username");
if (!token) {
    window.location.href = "index.html";
}
document.getElementById("nav-username").textContent = `👤 ${username}`;
// ── LOGOUT ─────────────────────────────────────────
window.logout = function () {
    localStorage.clear();
    window.location.href = "index.html";
};
// ── LOAD DATA ──────────────────────────────────────
window.loadData = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const tableDiv = document.getElementById("data-table");
        tableDiv.innerHTML = "<p>กำลังโหลด...</p>";
        try {
            const res = yield apiCall({ action: "getData" });
            if (!res.success || !res.data.length) {
                tableDiv.innerHTML = "<p>ยังไม่มีข้อมูล</p>";
                return;
            }
            const rows = res.data.map((item) => `
      <tr>
        <td>${item.title}</td>
        <td>${item.detail}</td>
        <td>${item.timestamp}</td>
        <td><button class="btn-delete" onclick="deleteItem('${item.id}')">🗑️ ลบ</button></td>
      </tr>
    `).join("");
            tableDiv.innerHTML = `
      <table>
        <thead><tr><th>หัวข้อ</th><th>รายละเอียด</th><th>เวลา</th><th>จัดการ</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
        }
        catch (_a) {
            tableDiv.innerHTML = "<p style='color:red'>โหลดข้อมูลไม่สำเร็จ</p>";
        }
    });
};
// ── ADD DATA ───────────────────────────────────────
window.submitData = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const title = document.getElementById("input-title").value.trim();
        const detail = document.getElementById("input-detail").value.trim();
        const msgEl = document.getElementById("save-msg");
        if (!title || !detail) {
            showMsg(msgEl, "กรุณากรอกข้อมูลให้ครบ", false);
            return;
        }
        try {
            const res = yield apiCall({ action: "addData", title, detail });
            if (res.success) {
                showMsg(msgEl, "✅ บันทึกสำเร็จ!", true);
                document.getElementById("input-title").value = "";
                document.getElementById("input-detail").value = "";
                window.loadData();
            }
            else {
                showMsg(msgEl, "❌ บันทึกไม่สำเร็จ", false);
            }
        }
        catch (_a) {
            showMsg(msgEl, "❌ เกิดข้อผิดพลาด", false);
        }
    });
};
// ── DELETE DATA ────────────────────────────────────
window.deleteItem = function (id) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!confirm("ยืนยันการลบข้อมูล?"))
            return;
        const res = yield apiCall({ action: "deleteData", id });
        if (res.success)
            window.loadData();
    });
};
function showMsg(el, text, success) {
    el.textContent = text;
    el.className = success ? "success-msg" : "error-msg";
    setTimeout(() => { el.className = "hidden"; }, 3000);
}
// โหลดข้อมูลอัตโนมัติตอนเปิดหน้า
window.loadData();
