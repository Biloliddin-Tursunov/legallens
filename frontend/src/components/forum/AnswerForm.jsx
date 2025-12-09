import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Send } from "lucide-react";
import styles from "../../styles/forum.module.css";

const AnswerForm = ({ session, onSubmit, submitting }) => {
    const [newAnswer, setNewAnswer] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(newAnswer, () => setNewAnswer("")); // Callback orqali inputni tozalash
    };

    if (!session) {
        return (
            <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-100 text-blue-800 mt-10">
                Javob yozish uchun{" "}
                <Link to="/login" className="font-bold underline">
                    tizimga kiring
                </Link>
                .
            </div>
        );
    }

    return (
        <div className={styles.answerForm}>
            <form onSubmit={handleSubmit}>
                <textarea
                    className={styles.answerTextarea}
                    placeholder="O'z fikringiz yoki yechimingizni yozing..."
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    required
                />
                <div style={{ overflow: "hidden" }}>
                    <button
                        type="submit"
                        className={styles.submitAnswerBtn}
                        disabled={submitting}>
                        {submitting ? (
                            "Yuborilmoqda..."
                        ) : (
                            <>
                                <Send size={18} /> Javob berish
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AnswerForm;
