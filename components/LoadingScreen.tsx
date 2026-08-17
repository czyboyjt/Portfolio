
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoadingComplete }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onLoadingComplete, 800);
    }, 1800);

    return () => clearTimeout(timer);
  }, [onLoadingComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      animate={{ 
        opacity: isExiting ? 0 : 1,
        transition: { duration: 0.8, ease: "easeInOut" }
      }}
      className="fixed inset-0 z-[9999] bg-[#080808] flex flex-col items-center justify-center overflow-hidden"
    >
      <div className="relative flex flex-col items-center justify-center min-h-[300px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, filter: 'blur(8px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="flex flex-col items-center justify-center"
        >
          <div className="relative">
            <span className="text-white text-[13px] md:text-[14px] font-medium tracking-[1.2em] uppercase font-display select-none">
              Welcome
            </span>
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "130%", opacity: 0.5 }}
              transition={{ delay: 0.3, duration: 1, ease: "circOut" }}
              className="h-[1px] bg-white absolute -bottom-4 left-[-15%]"
            />
          </div>
        </motion.div>
      </div>

      {/* Frame Elements */}
      <div className="absolute top-16 left-16 w-12 h-[1px] bg-white/[0.04]" />
      <div className="absolute top-16 left-16 w-[1px] h-12 bg-white/[0.04]" />
      <div className="absolute bottom-16 right-16 w-12 h-[1px] bg-white/[0.04]" />
      <div className="absolute bottom-16 right-16 w-[1px] h-12 bg-white/[0.04]" />
      
      {/* Background Depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none -z-10" />
    </motion.div>
  );
};

export default LoadingScreen;

