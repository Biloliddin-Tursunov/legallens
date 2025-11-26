import React from "react";
import { MessageSquare, Send } from "lucide-react";
import styles from "../styles/aiAssistant.module.css";

const AIAssistant = () => {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <MessageSquare className={styles.icon} size={24} />
                <h3>AI Yuridik Yordamchi</h3>
            </div>

            <p className={styles.desc}>Yuridik savolingizni bering:</p>

            <div className={styles.inputWrapper}>
                <textarea
                    className={styles.textarea}
                    placeholder="Masalan: Shartnoma nima? Fuqarolik huquqi qanday sohalarga bo'linadi?"></textarea>
            </div>

            <button className={styles.button}>
                <Send size={18} />
                Savol berish
            </button>
        </div>
    );
};

export default AIAssistant;
