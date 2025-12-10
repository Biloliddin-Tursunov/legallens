// src/components/common/PageTransition.jsx
import React from "react";
import { motion } from "framer-motion";

const PageTransition = ({ children }) => {
    // Animatsiya variantlari
    const variants = {
        initial: {
            opacity: 0,
            y: 40,
            scale: 0.95,
            filter: "blur(10px)", // 🔥 Xiralik effekti
        },
        animate: {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)", // Tiniqlashadi
            transition: {
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1], // Custom Bezier (juda silliq)
            },
        },
        exit: {
            opacity: 0,
            y: -40,
            scale: 0.95,
            filter: "blur(10px)",
            transition: {
                duration: 0.4,
                ease: "easeIn",
            },
        },
    };

    return (
        <motion.div
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ width: "100%", transformOrigin: "top center" }}>
            {children}
        </motion.div>
    );
};

export default PageTransition;
