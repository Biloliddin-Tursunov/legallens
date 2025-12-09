import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import styles from "../../styles/adminDashboard.module.css";

const Messages = () => {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const { data } = await supabase
                .from("messages")
                .select("*")
                .order("created_at", { ascending: false });
            if (data) setMessages(data);
        };
        fetchData();
    }, []);

    return (
        <div className="animate-fade-in">
            <h2 className={styles.pageTitle}>Kelib tushgan savollar</h2>
            <div className={styles.tableCard}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Sana</th>
                            <th>Foydalanuvchi</th>
                            <th>Xabar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {messages.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="3"
                                    style={{
                                        textAlign: "center",
                                        padding: "2rem",
                                    }}>
                                    Xabarlar yo'q
                                </td>
                            </tr>
                        ) : (
                            messages.map((msg) => (
                                <tr key={msg.id}>
                                    <td
                                        style={{
                                            whiteSpace: "nowrap",
                                            color: "#64748b",
                                            fontSize: "0.875rem",
                                        }}>
                                        {new Date(
                                            msg.created_at
                                        ).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 500 }}>
                                            {msg.full_name}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "0.85rem",
                                                color: "#64748b",
                                            }}>
                                            {msg.contact_info}
                                        </div>
                                    </td>
                                    <td style={{ color: "#334155" }}>
                                        {msg.message_text}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Messages;
