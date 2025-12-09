import React from "react";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import styles from "../../styles/forum.module.css";

const QuestionCard = ({ question }) => {
    return (
        <div className={styles.questionCard}>
            <div className={styles.cardHeader}>
                <span className={styles.author}>{question.author_name}</span>
                <span>
                    {new Date(question.created_at).toLocaleDateString()}
                </span>
            </div>

            <Link to={`/forum/${question.id}`} className={styles.questionTitle}>
                {question.title}
            </Link>

            <p className={styles.questionPreview}>
                {question.body.length > 150
                    ? question.body.substring(0, 150) + "..."
                    : question.body}
            </p>

            <div className={styles.cardFooter}>
                <div className={styles.stats}>
                    <div className={styles.statItem}>
                        <MessageCircle size={16} />
                        {question.answers ? question.answers[0]?.count : 0}{" "}
                        javob
                    </div>
                </div>
                <Link to={`/forum/${question.id}`} className={styles.readMore}>
                    Batafsil ko'rish &rarr;
                </Link>
            </div>
        </div>
    );
};

export default QuestionCard;
