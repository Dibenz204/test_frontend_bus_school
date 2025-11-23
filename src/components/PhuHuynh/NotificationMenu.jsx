import React from "react";
import { motion } from "framer-motion";

const NotificationMenu = ({ onSelect }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
    className="fixed bottom-28 right-8 bg-white shadow-lg rounded-2xl p-4 w-60 space-y-3 border border-gray-100"
  >
    <button
      onClick={() => onSelect("denGan")}
      className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
    >
      🚍 Xe sắp đến gần
    </button>
    <button
      onClick={() => onSelect("tre")}
      className="w-full py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
    >
      ⏰ Xe bị trễ
    </button>
  </motion.div>
);

export default NotificationMenu;
