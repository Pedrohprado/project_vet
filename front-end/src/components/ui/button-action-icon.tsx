import { useEffect, useRef } from 'react';
import {
  CheckIcon,
  ChevronRightIcon,
  CircleCheckIcon,
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
  | 'vaccinate';

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

    const timeoutId = window.setTimeout(() => {
      iconRef.current?.startAnimation();
    }, 500);

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
