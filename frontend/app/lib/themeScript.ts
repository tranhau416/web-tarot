import { STORAGE_KEYS } from "./constants"

/**
 * Chạy trong <head> trước khi trang được vẽ: áp giao diện đã lưu để không bị nháy
 * từ giao diện mặc định sang giao diện đã chọn. Tách khỏi theme.ts (client) để layout
 * (server component) nhập được chuỗi này.
 */
export const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem(${JSON.stringify(STORAGE_KEYS.THEME)});if(t==="night"||t==="pixel")document.documentElement.dataset.theme=t}catch(e){}`
