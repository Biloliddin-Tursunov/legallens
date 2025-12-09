import React, { useState } from "react";
import { MessageSquare, Send, User, Phone } from "lucide-react";
import { supabase } from "../../supabaseClient";
import styles from "../../styles/aiAssistant.module.css";

const AIAssistant = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        contact: "",
        message: "",
    });
    const [status, setStatus] = useState("idle"); // idle, loading, success, error

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus("loading");

        try {
            const { error } = await supabase.from("messages").insert([
                {
                    full_name: formData.fullName,
                    contact_info: formData.contact,
                    message_text: formData.message,
                },
            ]);

            if (error) throw error;

            setStatus("success");
            setFormData({ fullName: "", contact: "", message: "" }); // Formani tozalash

            // 3 soniyadan keyin xabarni o'chirish
            setTimeout(() => setStatus("idle"), 3000);
        } catch (error) {
            console.error("Xatolik:", error);
            setStatus("error");
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <MessageSquare className={styles.icon} size={24} />
                <h3>Yuridik Yordam</h3>
            </div>

            <p className={styles.desc}>
                Savolingiz bormi? Bizga yozing, mutaxassislarimiz javob
                berishadi.
            </p>

            {status === "success" ? (
                <div className="bg-green-100 text-green-700 p-4 rounded-lg text-center mb-4">
                    Xabaringiz qabul qilindi! Tez orada bog'lanamiz.
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    {/* Ism Input */}
                    <div className={styles.inputGroup}>
                        <div className={styles.inputIconWrapper}>
                            <User size={16} className={styles.inputIcon} />
                        </div>
                        <input
                            type="text"
                            name="fullName"
                            required
                            value={formData.fullName}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="Ismingiz"
                        />
                    </div>

                    {/* Kontakt Input */}
                    <div className={styles.inputGroup}>
                        <div className={styles.inputIconWrapper}>
                            <Phone size={16} className={styles.inputIcon} />
                        </div>
                        <input
                            type="text"
                            name="contact"
                            required
                            value={formData.contact}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="Tel yoki Telegram (@user)"
                        />
                    </div>

                    {/* Xabar Textarea */}
                    <div className={styles.inputWrapper}>
                        <textarea
                            name="message"
                            required
                            value={formData.message}
                            onChange={handleChange}
                            className={styles.textarea}
                            placeholder="Savolingizni batafsil yozing..."></textarea>
                    </div>

                    <button
                        type="submit"
                        className={styles.button}
                        disabled={status === "loading"}>
                        <Send size={18} />
                        {status === "loading" ? "Yuborilmoqda..." : "Yuborish"}
                    </button>

                    {status === "error" && (
                        <p className="text-red-500 text-sm mt-2 text-center">
                            Xatolik yuz berdi. Qaytadan urining.
                        </p>
                    )}
                </form>
            )}
        </div>
    );
};

export default AIAssistant;
