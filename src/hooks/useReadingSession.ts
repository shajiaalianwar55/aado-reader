import { useEffect } from 'react';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import * as ScreenOrientation from 'expo-screen-orientation';

const TAG = 'aado-reader';

export function useReadingSession(enabled: boolean) {
  useEffect(() => {
    let active = true;
    (async () => {
      await ScreenOrientation.unlockAsync();
      if (enabled) {
        await activateKeepAwakeAsync(TAG);
      }
    })();

    return () => {
      active = false;
      deactivateKeepAwake(TAG);
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {
        // ignore unlock failures on web/unsupported platforms
      });
      void active;
    };
  }, [enabled]);
}
