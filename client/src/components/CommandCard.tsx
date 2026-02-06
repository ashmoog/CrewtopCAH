import { motion } from "framer-motion";

interface CommandCardProps {
  command: string;
  description: string;
  index: number;
}

export function CommandCard({ command, description, index }: CommandCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      viewport={{ once: true }}
      className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors"
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-gray-800 to-black flex items-center justify-center border border-white/10 shadow-lg font-mono text-primary font-bold text-lg">
        {index + 1}
      </div>
      <div>
        <code className="text-lg font-bold text-primary font-mono bg-primary/10 px-2 py-1 rounded-md">
          {command}
        </code>
        <p className="mt-2 text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
}
