'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  onClick?: () => void;
}

export function AnimatedCard({ children, className, delay = 0, onClick }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay,
        ease: [0.21, 1.11, 0.81, 0.99] 
      }}
      whileHover={{ 
        y: -2, 
        transition: { duration: 0.2 } 
      }}
      className={className}
    >
      <Card 
        className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer"
        onClick={onClick}
      >
        {children}
      </Card>
    </motion.div>
  );
}