import { useEffect, useRef, RefObject } from 'react';

export interface UseInfiniteScrollOptions {
  /** When false, the observer does not trigger onLoadMore */
  enabled: boolean;
  /** Whether there are more items to load */
  hasMore: boolean;
  /** When true, do not trigger onLoadMore (e.g. a load is already in progress) */
  isLoading: boolean;
  /** Called when the sentinel enters the root (or viewport). Caller should load the next page. */
  onLoadMore: () => void | Promise<void>;
  /** Root margin for the IntersectionObserver (default: '200px 0px') */
  rootMargin?: string;
  /** Threshold for the IntersectionObserver (default: 0) */
  threshold?: number;
}

export interface UseInfiniteScrollReturn {
  /** Attach to the element that should be observed (e.g. at the end of the list) */
  sentinelRef: RefObject<HTMLDivElement | null>;
  /** Attach to the scrollable container; when set, it is used as the observer root. Omit or leave unattached for viewport-based scroll. */
  scrollContainerRef: RefObject<HTMLDivElement | null>;
}

/**
 * Reusable infinite scroll via IntersectionObserver.
 * - Attach sentinelRef to a sentinel element at the bottom of the list.
 * - Attach scrollContainerRef to the scrollable div to use it as root (required when the list scrolls inside a container).
 * - When the sentinel becomes visible (within rootMargin of the root), onLoadMore is called if enabled && hasMore && !isLoading.
 */
export function useInfiniteScroll(options: UseInfiniteScrollOptions): UseInfiniteScrollReturn {
  const {
    enabled,
    hasMore,
    isLoading,
    onLoadMore,
    rootMargin = '200px 0px',
    threshold = 0,
  } = options;

  const sentinelRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const root = scrollContainerRef.current;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) return;
        if (!hasMore || isLoading) return;
        void onLoadMore();
      },
      { root: root || null, rootMargin, threshold }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [enabled, hasMore, isLoading, onLoadMore, rootMargin, threshold]);

  return { sentinelRef, scrollContainerRef };
}
