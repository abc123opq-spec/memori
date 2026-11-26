import { JSX, forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import { View, LayoutChangeEvent, StyleProp, ViewStyle } from "react-native";

export interface IWeekCalendarPagerHandle {
  scrollToIndex: (index: number, animated?: boolean) => void;
}

export interface IWeekCalendarPagerProps {
  data: number[];
  initialIndex: number;
  onPageChange: (index: number) => void;
  renderPage: (firstDayOfWeek: number) => JSX.Element;
}

const containerStyle = {
  flexDirection: "row",
  overflowX: "auto",
  overflowY: "hidden",
  scrollSnapType: "x mandatory",
  WebkitOverflowScrolling: "touch",
} as unknown as StyleProp<ViewStyle>;

const RENDERED_NEIGHBOURS = 2;

const pageWrapperBaseStyle = {
  flexShrink: 0,
  scrollSnapAlign: "center",
  scrollSnapStop: "always",
};

export const WeekCalendarPager = forwardRef<IWeekCalendarPagerHandle, IWeekCalendarPagerProps>(
  function WeekCalendarPager(props, ref) {
    const { data, initialIndex, onPageChange, renderPage } = props;
    const [pageWidth, setPageWidth] = useState(0);
    const [node, setNode] = useState<HTMLElement | null>(null);
    const pageWidthRef = useRef(0);
    pageWidthRef.current = pageWidth;
    const lastEmittedIndexRef = useRef<number>(-1);
    const initialIndexRef = useRef(initialIndex);
    initialIndexRef.current = initialIndex;
    const onPageChangeRef = useRef(onPageChange);
    onPageChangeRef.current = onPageChange;
    const [activeIndex, setActiveIndex] = useState(initialIndex);
    const programmaticScrollUntilRef = useRef(0);

    const setContainerRef = useCallback((el: View | null) => {
      setNode((el as unknown as HTMLElement | null) ?? null);
    }, []);

    const performScroll = useCallback(
      (index: number, animated: boolean): void => {
        const el = node;
        const width = pageWidthRef.current;
        if (!el || width <= 0 || index < 0) {
          return;
        }
        programmaticScrollUntilRef.current = Date.now() + (animated ? 600 : 120);
        lastEmittedIndexRef.current = index;
        setActiveIndex(index);
        try {
          el.scrollTo({ left: index * width, behavior: animated ? "smooth" : "auto" });
        } catch {
          el.scrollLeft = index * width;
        }
      },
      [node]
    );

    useImperativeHandle(
      ref,
      () => ({
        scrollToIndex: (index, animated = false) => {
          if (index === lastEmittedIndexRef.current) {
            return;
          }
          performScroll(index, animated);
        },
      }),
      [performScroll]
    );

    const handleLayout = useCallback((event: LayoutChangeEvent) => {
      const width = event.nativeEvent.layout.width;
      if (width > 0 && width !== pageWidthRef.current) {
        setPageWidth(width);
      }
    }, []);

    useLayoutEffect(() => {
      if (!node || pageWidth <= 0) {
        return;
      }
      const idx = lastEmittedIndexRef.current >= 0 ? lastEmittedIndexRef.current : initialIndexRef.current;
      if (idx < 0) {
        return;
      }
      programmaticScrollUntilRef.current = Date.now() + 120;
      lastEmittedIndexRef.current = idx;
      node.scrollLeft = idx * pageWidth;
    }, [node, pageWidth]);

    useEffect(() => {
      if (!node) {
        return;
      }
      const onScroll = (): void => {
        const width = pageWidthRef.current;
        if (width <= 0) {
          return;
        }
        const idx = Math.round(node.scrollLeft / width);
        setActiveIndex(idx);
        if (Date.now() < programmaticScrollUntilRef.current) {
          return;
        }
        if (idx !== lastEmittedIndexRef.current) {
          lastEmittedIndexRef.current = idx;
          onPageChangeRef.current(idx);
        }
      };
      node.addEventListener("scroll", onScroll, { passive: true });
      return () => node.removeEventListener("scroll", onScroll);
    }, [node]);

    return (
      <View ref={setContainerRef} onLayout={handleLayout} style={containerStyle}>
        {pageWidth > 0 &&
          data.map((firstDayOfWeek, index) => (
            <View
              key={firstDayOfWeek}
              style={{ ...pageWrapperBaseStyle, width: pageWidth } as unknown as StyleProp<ViewStyle>}
            >
              {/* personal-fork: years of weeks make hundreds of pages, so only pages next to the visible one render */}
              {Math.abs(index - activeIndex) <= RENDERED_NEIGHBOURS ? renderPage(firstDayOfWeek) : null}
            </View>
          ))}
      </View>
    );
  }
);
