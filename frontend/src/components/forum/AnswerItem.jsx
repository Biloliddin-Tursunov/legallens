import React from "react";
import styles from "../../styles/forum.module.css";

const AnswerItem = ({ answer }) => {
    return (
        <div className={styles.answerCard}>
            <div className={styles.answerAuthorBadge}>
                <div className={styles.avatarPlaceholder}>
                    {answer.author_name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <span className="font-bold text-slate-700 block">
                        {answer.author_name}
                    </span>
                    <span className="text-xs text-slate-400">
                        {new Date(answer.created_at).toLocaleString()}
                    </span>
                </div>
            </div>
            <div className={styles.answerBody}>{answer.body}</div>
        </div>
    );
};

export default AnswerItem;
