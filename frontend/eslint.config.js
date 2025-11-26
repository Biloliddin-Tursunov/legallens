import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
    globalIgnores(["dist"]),
    {
        files: ["**/*.{js,jsx}"],
        extends: [
            js.configs.recommended,
            reactHooks.configs.flat.recommended,
            reactRefresh.configs.vite,
        ],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                ecmaVersion: "latest",
                ecmaFeatures: { jsx: true },
                sourceType: "module",
            },
        },
        rules: {
            "no-unused-vars": "off", // ishlatilmagan o'zgaruvchilar xatolarini o'chirish
            "no-undef": "off", // aniqlanmagan identifikatorlar uchun xatolarni o'chirish
            "react-hooks/rules-of-hooks": "off", // react-hooks qoidalarini o'chirish (agar kerak bo'lsa)
            "react-hooks/exhaustive-deps": "off", // useEffect dependency warninglarini o'chirish
        },
    },
]);
