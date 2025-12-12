import { SafeArea } from 'capacitor-plugin-safe-area';
import { useLayoutEffect } from 'react';

export const useSafeAreaInsets = () => {
  useLayoutEffect(() => {
    SafeArea.getSafeAreaInsets().then(data => {
      const { insets } = data;
      console.log('Safe area insets:', insets);
      document.body.style.setProperty('--safe-area-inset-top', `${insets.top}px`);
      document.body.style.setProperty('--safe-area-inset-right', `${insets.right}px`);
      document.body.style.setProperty('--safe-area-inset-bottom', `${insets.bottom}px`);
      document.body.style.setProperty('--safe-area-inset-left', `${insets.left}px`);
    });
  }, []);
};
