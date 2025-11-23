import React from "react";
import { motion } from "framer-motion";
import { Bell } from "lucide-react";

const FloatingNotificationButton = ({ onClick }) => (
  <motion.button
    animate={{ opacity: [1, 0.6, 1] }}
    transition={{ repeat: Infinity, duration: 1 }}
    onClick={onClick}
    className="fixed bottom-8 right-8 bg-yellow-500 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
  >
    <Bell size={28} />
  </motion.button>
);

export default FloatingNotificationButton;
