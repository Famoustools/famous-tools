import { apiCall, DataItem } from "./api.js";

// ตรวจสอบ Login
const token = localStorage.getItem("token");
const username = localStorage.getItem("username");
if (!token) {
  window.location.href = "index.html";
}

document.getElementById("nav-username")!.textContent = `👤 ${username}`;

// ── LOGOUT ─────────────────────────────────────────
(window as any).logout = function (): void {
  localStorage.clear();
  window.location.href = "index.html";
};

// ── LOAD DATA ──────────────────────────────────────
(window as any).loadData = async function (): Promise<void> {
  const tableDiv = document.getElementById("data-table")!;
  tableDiv.innerHTML = "<p>กำลังโหลด...</p>";

  try {
    const res = await apiCall({ action: "getData" });

    if (!res.success || !res.data.length) {
      tableDiv.innerHTML = "<p>ยังไม่มีข้อมูล</p>";
      return;
    }

    const rows = res.data.map((item: DataItem) => `
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
  } catch {
    tableDiv.innerHTML = "<p style='color:red'>โหลดข้อมูลไม่สำเร็จ</p>";
  }
};

// ── ADD DATA ───────────────────────────────────────
(window as any).submitData = async function (): Promise<void> {
  const title = (document.getElementById("input-title") as HTMLInputElement).value.trim();
  const detail = (document.getElementById("input-detail") as HTMLTextAreaElement).value.trim();
  const msgEl = document.getElementById("save-msg")!;

  if (!title || !detail) {
    showMsg(msgEl, "กรุณากรอกข้อมูลให้ครบ", false);
    return;
  }

  try {
    const res = await apiCall({ action: "addData", title, detail });
    if (res.success) {
      showMsg(msgEl, "✅ บันทึกสำเร็จ!", true);
      (document.getElementById("input-title") as HTMLInputElement).value = "";
      (document.getElementById("input-detail") as HTMLTextAreaElement).value = "";
      (window as any).loadData();
    } else {
      showMsg(msgEl, "❌ บันทึกไม่สำเร็จ", false);
    }
  } catch {
    showMsg(msgEl, "❌ เกิดข้อผิดพลาด", false);
  }
};

// ── DELETE DATA ────────────────────────────────────
(window as any).deleteItem = async function (id: string): Promise<void> {
  if (!confirm("ยืนยันการลบข้อมูล?")) return;
  const res = await apiCall({ action: "deleteData", id });
  if (res.success) (window as any).loadData();
};

function showMsg(el: HTMLElement, text: string, success: boolean): void {
  el.textContent = text;
  el.className = success ? "success-msg" : "error-msg";
  setTimeout(() => { el.className = "hidden"; }, 3000);
}

// โหลดข้อมูลอัตโนมัติตอนเปิดหน้า
(window as any).loadData();