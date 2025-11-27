// server/utils/authUtils.js
import crypto from "crypto";

/**
 * Vaqtinchalik 6 xonali kod yaratadi.
 * @returns {string} 6 xonali tasodifiy raqamli kod.
 */
export const generateOtpCode = () => {
    // 100000 dan 999999 gacha bo'lgan tasodifiy raqam
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Kodning amal qilish vaqtini hisoblaydi (hozirgi vaqtdan + 5 daqiqa).
 * @returns {Date} Tugash vaqti.
 */
export const getExpirationTime = () => {
    const date = new Date();
    date.setMinutes(date.getMinutes() + 5); // 5 daqiqa amal qilish muddati
    return date;
};

/**
 * Tokenni xavfsiz tarzda hashlaydi (JWT/Session yaratish uchun keyingi bosqichda kerak bo'ladi).
 * @param {string} userId - Foydalanuvchi ID si.
 * @returns {string} Hashlangan qiymat.
 */
export const hashUserId = (userId) => {
    return crypto.createHash("sha256").update(userId).digest("hex");
};
