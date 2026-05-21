
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);
  const [textPhase, setTextPhase] = useState<'designer' | 'builder' | 'complete'>('designer');
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Phase 1: Designer -> Product Builder (2s for better readability)
    const phaseTimer = setTimeout(() => {
      setTextPhase('builder');
    }, 2000);

    // Progress interval: Hits 100% around 3.5s
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return Math.min(prev + 5, 100);
      });
    }, 180);

    return () => {
      clearTimeout(phaseTimer);
      clearInterval(progressInterval);
    };
  }, []);

  // Watch for completion trigger
  useEffect(() => {
    if (progress === 100 && textPhase === 'builder') {
      const completeTimer = setTimeout(() => {
        setTextPhase('complete');
        
        setTimeout(() => {
          setIsExiting(true);
          setTimeout(onLoadingComplete, 1000);
        }, 2000);
      }, 1000);
      
      return () => clearTimeout(completeTimer);
    }
  }, [progress, textPhase, onLoadingComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      animate={{ 
        opacity: isExiting ? 0 : 1,
        transition: { duration: 0.8, ease: "easeInOut" }
      }}
      className="fixed inset-0 z-[9999] bg-[#080808] flex flex-col items-center justify-center overflow-hidden"
    >
      <div className="relative flex flex-col items-center justify-center min-h-[400px]">
        <AnimatePresence mode='wait'>
          {textPhase !== 'complete' ? (
            <motion.div
              key="loading-phase"
              initial={{ opacity: 0, filter: 'blur(10px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(15px)', y: -20 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="flex flex-col items-center"
            >
              {/* Swirling Ethereal Particles */}
              <div className="relative w-40 h-40 mb-24 flex items-center justify-center">
                {/* Rotating Container */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                >
                  {/* Orange Particle */}
                  <motion.div 
                    className="absolute top-0 w-2.5 h-2.5 rounded-full bg-[#f97316]/90"
                    style={{ 
                      boxShadow: '0 0 45px 18px rgba(249, 115, 22, 0.6), 0 0 90px 35px rgba(249, 115, 22, 0.3)',
                      filter: 'blur(2px)'
                    }}
                    animate={{ 
                      scale: [1, 1.35, 1],
                      opacity: [0.7, 1, 0.7],
                      x: [0, 22, 0],
                      y: [0, -18, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />
                  
                  {/* Blue Particle */}
                  <motion.div 
                    className="absolute bottom-0 w-2.5 h-2.5 rounded-full bg-[#3b82f6]/90"
                    style={{ 
                      boxShadow: '0 0 45px 18px rgba(59, 130, 246, 0.6), 0 0 90px 35px rgba(59, 130, 246, 0.3)',
                      filter: 'blur(2px)'
                    }}
                    animate={{ 
                      scale: [1.35, 1, 1.35],
                      opacity: [1, 0.7, 1],
                      x: [0, -22, 0],
                      y: [0, 18, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />
                </motion.div>
                
                {/* Central soft ambient depth */}
                <motion.div 
                  className="absolute inset-8 bg-white/[0.05] rounded-full blur-[50px]"
                  animate={{ opacity: [0.1, 0.5, 0.1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
              </div>

              {/* Text Section for Initial Phases */}
              <div className="h-12 flex items-center justify-center text-center">
                <AnimatePresence mode='wait' initial={true}>
                  {textPhase === 'designer' && (
                    <motion.div
                      key="designer-label"
                      initial={{ opacity: 0, filter: 'blur(8px)', y: 10 }}
                      animate={{ 
                        opacity: [0.7, 1, 0.7],
                        filter: ['blur(0px)', 'blur(0.5px)', 'blur(0px)'],
                        y: 0 
                      }}
                      exit={{ opacity: 0, filter: 'blur(8px)', y: -10, transition: { duration: 0.8 } }}
                      transition={{ 
                        opacity: { repeat: Infinity, duration: 2, ease: "easeInOut" },
                        filter: { repeat: Infinity, duration: 2, ease: "easeInOut" },
                        default: { duration: 1.2, delay: 0.2, ease: "easeOut" }
                      }}
                    >
                      <span className="text-[#f97316] text-[13px] font-black tracking-[1.8em] uppercase font-sans drop-shadow-[0_0_15px_rgba(249,115,22,0.8)] drop-shadow-[0_0_30px_rgba(249,115,22,0.4)]">
                        Design
                      </span>
                    </motion.div>
                  )}

                  {textPhase === 'builder' && (
                    <motion.div
                      key="builder-label"
                      initial={{ opacity: 0, filter: 'blur(8px)', y: 10 }}
                      animate={{ 
                        opacity: [0.7, 1, 0.7],
                        filter: ['blur(0px)', 'blur(0.5px)', 'blur(0px)'],
                        y: 0 
                      }}
                      exit={{ opacity: 0, filter: 'blur(8px)', y: -10, transition: { duration: 0.8 } }}
                      transition={{ 
                        opacity: { repeat: Infinity, duration: 2, ease: "easeInOut" },
                        filter: { repeat: Infinity, duration: 2, ease: "easeInOut" },
                        default: { duration: 1.2, ease: "easeOut" }
                      }}
                    >
                      <span className="text-[#3b82f6] text-[13px] font-black tracking-[1.8em] uppercase font-sans drop-shadow-[0_0_15px_rgba(59,130,246,0.8)] drop-shadow-[0_0_30px_rgba(59,130,246,0.4)]">
                        Product
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="complete-phase"
              initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="flex flex-col items-center justify-center"
            >
              <div className="relative">
                <span className="text-white text-[12px] font-medium tracking-[1.2em] uppercase font-display">
                  Welcome
                </span>
                <motion.div 
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "130%", opacity: 0.5 }}
                  transition={{ delay: 0.4, duration: 1.2, ease: "circOut" }}
                  className="h-[1px] bg-white absolute -bottom-4 left-[-15%]"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Frame Elements */}
      <div className="absolute top-16 left-16 w-12 h-[1px] bg-white/[0.04]" />
      <div className="absolute top-16 left-16 w-[1px] h-12 bg-white/[0.04]" />
      <div className="absolute bottom-16 right-16 w-12 h-[1px] bg-white/[0.04]" />
      <div className="absolute bottom-16 right-16 w-[1px] h-12 bg-white/[0.04]" />
      
      {/* Background Depth */}
      <div className="absolute top-0 right-0 w-[60vw] h-[60vh] bg-[#f97316]/[0.01] blur-[150px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[60vw] h-[60vh] bg-[#3b82f6]/[0.01] blur-[150px] -z-10" />
    </motion.div>
  );
};

export default LoadingScreen;
