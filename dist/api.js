var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export const API_URL = "https://script.google.com/macros/s/AKfycbxnmgOnPPpW5TeB6OrGlOdKAi5lLstsu_MC3Ns__Nf7kZlBVE3d6sdA3YpH1iUy7OUt/exec";
export function apiCall(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = new URLSearchParams(params).toString();
        const res = yield fetch(`${API_URL}?${query}`, {
            method: "GET",
            redirect: "follow",
        });
        const text = yield res.text();
        try {
            return JSON.parse(text);
        }
        catch (_a) {
            return { success: false, message: "Response parse error: " + text };
        }
    });
}
