import * as Haptics from 'expo-haptics';

export async function selectionHaptic(enabled: boolean) {
  if (!enabled) return;
  try {
    await Haptics.selectionAsync();
  } catch {
    // ignore unsupported platforms
  }
}

export async function lightImpactHaptic(enabled: boolean) {
  if (!enabled) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // ignore unsupported platforms
  }
}
