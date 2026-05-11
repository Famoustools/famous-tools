import { apiCall, LoginResponse } from "./api.js";

// ถ้า login แล้ว ให้ redirect ไป dashboard
if (localStorage.getItem("token")) {
  window.location.href = "dashboard.html";
}

(window as any).loginHandler = async function (): Promise<void> {
  const username = (document.getElementById("username") as HTMLInputElement).value.trim();
  const password = (document.getElementById("password") as HTMLInputElement).value.trim();
  const errorMsg = document.getElementById("error-msg")!;
  const btn = document.getElementById("login-btn") as HTMLButtonElement;

  if (!username || !password) {
    showError("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
    return;
  }

  btn.textContent = "กำลังเข้าสู่ระบบ...";
  btn.disabled = true;

  try {
    const res: LoginResponse = await apiCall({ action: "login", username, password });

    if (res.success && res.token) {
      localStorage.setItem("token", res.token);
      localStorage.setItem("username", res.username!);
      localStorage.setItem("role", res.role!);
      window.location.href = "dashboard.html";
    } else {
      showError(res.message || "เกิดข้อผิดพลาด");
    }
  } catch (e) {
    showError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
  } finally {
    btn.textContent = "เข้าสู่ระบบ";
    btn.disabled = false;
  }
};

function showError(msg: string): void {
  const el = document.getElementById("error-msg")!;
  el.textContent = msg;
  el.classList.remove("hidden");
}