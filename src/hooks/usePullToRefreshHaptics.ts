import { useRef, useCallback } from 'react';
import { NativeSyntheticEvent, NativeScrollEvent, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export const usePullToRefreshHaptics = (refreshThreshold: number = 70) => {
  const previousScrollY = useRef(0);
  const hasTriggeredRefresh = useRef(false);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (Platform.OS !== 'ios') return;

    const currentScrollY = event.nativeEvent.contentOffset.y;
    if (currentScrollY < 0) {
      const pullDistance = Math.abs(currentScrollY);
      const prevPullDistance = Math.abs(previousScrollY.current);
      const step = 0.1; 
      const currentTick = Math.floor(pullDistance / step);
      const prevTick = Math.floor(prevPullDistance / step);
      if (currentTick !== prevTick) {
        if (pullDistance < refreshThreshold) {
          Haptics.selectionAsync();
        }
      }

      if (pullDistance >= refreshThreshold && prevPullDistance < refreshThreshold) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
        hasTriggeredRefresh.current = true;
      }
      if (pullDistance < refreshThreshold && prevPullDistance >= refreshThreshold) {
        hasTriggeredRefresh.current = false;
      }

    } else if (previousScrollY.current < 0 && currentScrollY >= 0) {
      Haptics.selectionAsync();
      hasTriggeredRefresh.current = false;
    }

    previousScrollY.current = currentScrollY;
  }, [refreshThreshold]);

  return { handleScroll };
};
