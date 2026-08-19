import { useEffect, useRef } from 'react';
import { motion, useAnimation } from 'motion/react';
import { cn } from '@/lib/utils';

type AnimatedTrashIconProps = {
  animate?: boolean;
  size?: number;
  className?: string;
};

const LID_LIFT = {
  normal: { y: 0, rotate: 0 },
  animate: { y: -4.5, rotate: -18 },
};

export function AnimatedTrashIcon({
  animate = false,
  size = 16,
  className,
}: AnimatedTrashIconProps) {
  const lidControls = useAnimation();
  const delayRef = useRef<number | null>(null);

  useEffect(() => {
    if (delayRef.current !== null) {
      window.clearTimeout(delayRef.current);
      delayRef.current = null;
    }

    if (!animate) {
      void lidControls.start('normal');
      return;
    }

    void lidControls.start('normal');
    delayRef.current = window.setTimeout(() => {
      void lidControls.start('animate');
      delayRef.current = null;
    }, 500);

    return () => {
      if (delayRef.current !== null) {
        window.clearTimeout(delayRef.current);
      }
    };
  }, [animate, lidControls]);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      overflow="visible"
      className={cn('shrink-0 overflow-visible', className)}
    >
      <motion.g
        initial="normal"
        animate={lidControls}
        variants={LID_LIFT}
        transition={{ type: 'spring', stiffness: 380, damping: 16 }}
        style={{ transformBox: 'fill-box', transformOrigin: '0% 100%' }}
      >
        <path d="M4 7h16" />
        <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      </motion.g>
      <path d="M6 7v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7" />
      <line x1="10" x2="10" y1="12" y2="17" />
      <line x1="14" x2="14" y1="12" y2="17" />
    </svg>
  );
}
