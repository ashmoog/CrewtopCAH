import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  delay?: number;
}

export function StatCard({ label, value, icon: Icon, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="glass-card p-8 rounded-3xl flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-primary/50 transition-colors duration-300"
    >
      <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors duration-500" />
      
      <div className="bg-primary/10 p-4 rounded-2xl mb-4 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
        <Icon className="w-8 h-8 text-primary" />
      </div>
      
      <h3 className="text-4xl font-bold mb-2 font-display">{value.toLocaleString()}</h3>
      <p className="text-muted-foreground font-medium">{label}</p>
    </motion.div>
  );
}
