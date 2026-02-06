import { motion } from "framer-motion";

interface PlayingCardProps {
  text: string;
  type: "black" | "white";
  className?: string;
  rotation?: number;
}

export function PlayingCard({ text, type, className = "", rotation = 0 }: PlayingCardProps) {
  const isBlack = type === "black";
  
  return (
    <motion.div
      initial={{ rotate: rotation, y: 100, opacity: 0 }}
      animate={{ rotate: rotation, y: 0, opacity: 1 }}
      whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`
        w-64 h-80 rounded-2xl p-6 flex flex-col justify-between shadow-2xl relative
        ${isBlack ? "bg-black text-white border-2 border-white/10" : "bg-white text-black border-2 border-gray-200"}
        ${className}
      `}
    >
      <h3 className={`text-2xl font-bold leading-tight font-display ${isBlack ? "text-white" : "text-black"}`}>
        {text}
      </h3>
      
      <div className="flex items-center gap-2 mt-auto">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${isBlack ? "bg-white text-black" : "bg-black text-white"}`}>
          CH
        </div>
        <span className={`text-xs font-bold uppercase tracking-wider ${isBlack ? "text-white/60" : "text-black/60"}`}>
          Discord Edition
        </span>
      </div>
    </motion.div>
  );
}
