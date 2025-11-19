"use client";

import { motion } from "framer-motion";
import { Globe } from "@/components/Globe";

export const Greeting = () => {
  return (
    <div
      className="mx-auto flex size-full max-w-3xl flex-col justify-center px-4 md:px-8"
      key="overview"
    >
      <Globe />
      <div className="relative z-1">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="font-semibold text-xl md:text-2xl"
          exit={{ opacity: 0, y: 10 }}
          initial={{ opacity: 0, y: 10 }}
          transition={{ delay: 0.5 }}
        >
          What decision are you making?
        </motion.div>
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="text-xl text-zinc-500 md:text-2xl"
          exit={{ opacity: 0, y: 10 }}
          initial={{ opacity: 0, y: 10 }}
          transition={{ delay: 0.6 }}
        >
          Describe the uncertainty you want to understand.
        </motion.div>
      </div>
    </div>
  );
};
