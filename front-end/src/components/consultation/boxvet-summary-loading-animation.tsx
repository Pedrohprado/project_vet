import { BIRD_SRC, DOG_CAT_BOX_SRC } from '@/lib/brand';

type BoxvetSummaryLoadingAnimationProps = {
  className?: string;
};

export function BoxvetSummaryLoadingAnimation({
  className,
}: BoxvetSummaryLoadingAnimationProps) {
  return (
    <div
      className={[
        'flex min-h-0 flex-1 flex-col items-center justify-center gap-2 overflow-hidden rounded-md border border-dashed px-4 py-3 text-center',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className='boxvet-loading-scene relative mx-auto w-full max-w-[240px] shrink overflow-hidden'>
        <img
          src={DOG_CAT_BOX_SRC}
          alt=''
          aria-hidden
          className='pointer-events-none absolute inset-0 z-10 size-full object-contain'
        />
        <img
          src={BIRD_SRC}
          alt=''
          aria-hidden
          className='boxvet-loading-bird pointer-events-none absolute right-[25%] top-[14%] z-20 w-[22%]'
        />
      </div>

      <p className='text-muted-foreground shrink-0 text-sm font-medium'>
        A BoxVet está preparando o texto para você
        <span className='ellipsis-dots' aria-hidden>
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </span>
      </p>
    </div>
  );
}
