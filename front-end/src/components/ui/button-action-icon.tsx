import { useEffect, useRef } from 'react';
import {
  CheckIcon,
  ChevronRightIcon,
  CircleCheckIcon,
  CornerUpRightIcon,
  PlusIcon,
  SendIcon,
  SquarePenIcon,
  SyringeIcon,
} from 'lucide-animated';
import { AnimatedTrashIcon } from '@/components/ui/animated-trash-icon';

export type ButtonAction =
  | 'delete'
  | 'save'
  | 'continue'
  | 'finish'
  | 'add'
  | 'share'
  | 'edit'
  | 'vaccinate'
  | 'join';

type IconHandle = {
  startAnimation: () => void;
  stopAnimation: () => void;
};

const LUCIDE_ACTION_ICONS = {
  save: CheckIcon,
  continue: ChevronRightIcon,
  finish: CircleCheckIcon,
  add: PlusIcon,
  share: SendIcon,
  edit: SquarePenIcon,
  vaccinate: SyringeIcon,
  join: CornerUpRightIcon,
} as const;

type ButtonActionIconProps = {
  action: ButtonAction;
  animate: boolean;
  size?: number;
};

export function ButtonActionIcon({
  action,
  animate,
  size = 16,
}: ButtonActionIconProps) {
  const iconRef = useRef<IconHandle>(null);

  useEffect(() => {
    if (action === 'delete') return;

    if (!animate) {
      iconRef.current?.stopAnimation();
      return;
    }

    const delayMs = action === 'join' ? 0 : 500;

    const start = () => {
      iconRef.current?.startAnimation();
    };

    if (delayMs === 0) {
      start();
      return () => {
        iconRef.current?.stopAnimation();
      };
    }

    const timeoutId = window.setTimeout(start, delayMs);

    return () => {
      window.clearTimeout(timeoutId);
      iconRef.current?.stopAnimation();
    };
  }, [action, animate]);

  if (action === 'delete') {
    return <AnimatedTrashIcon animate={animate} size={size} />;
  }

  const Icon = LUCIDE_ACTION_ICONS[action];

  return (
    <Icon
      ref={iconRef}
      size={size}
      animateOnHover={false}
      className="text-current"
    />
  );
}
