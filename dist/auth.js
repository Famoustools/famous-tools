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
// ถ้า login แล้ว ให้ redirect ไป dashboard
if (localStorage.getItem("token")) {
    window.location.href = "dashboard.html";
}
window.loginHandler = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();
        const errorMsg = document.getElementById("error-msg");
        const btn = document.getElementById("login-btn");
        if (!username || !password) {
            showError("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
            return;
        }
        btn.textContent = "กำลังเข้าสู่ระบบ...";
        btn.disabled = true;
        try {
            const res = yield apiCall({ action: "login", username, password });
            if (res.success && res.token) {
                localStorage.setItem("token", res.token);
                localStorage.setItem("username", res.username);
                localStorage.setItem("role", res.role);
                window.location.href = "dashboard.html";
            }
            else {
                showError(res.message || "เกิดข้อผิดพลาด");
            }
        }
        catch (e) {
            showError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
        }
        finally {
            btn.textContent = "เข้าสู่ระบบ";
            btn.disabled = false;
        }
    });
};
function showError(msg) {
    const el = document.getElementById("error-msg");
    el.textContent = msg;
    el.classList.remove("hidden");
}
