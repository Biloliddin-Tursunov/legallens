import React from "react";
import { User, LogOut } from "lucide-react";
import styles from "../../styles/account.module.css";

const ProfileHeader = ({ profile, onLogout }) => {
    return (
        <div className={styles.profileCard}>
            <div className={styles.userInfo}>
                <div className={styles.avatar}>
                    {profile?.first_name ? (
                        profile.first_name.charAt(0).toUpperCase()
                    ) : (
                        <User size={40} />
                    )}
                </div>
                <div>
                    <h1 className={styles.userName}>
                        {profile?.first_name || "Foydalanuvchi"}
                    </h1>
                    <p className={styles.userPhone}>
                        {profile?.phone_number || "Telefon raqam yo'q"}
                    </p>
                </div>
            </div>
            <button onClick={onLogout} className={styles.logoutBtn}>
                <LogOut size={18} /> Chiqish
            </button>
        </div>
    );
};

export default ProfileHeader;
