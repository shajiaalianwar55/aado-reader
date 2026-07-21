import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { FitMode, ScrollMode } from '@/src/types';
import { formatReadingProgress } from '@/src/lib/readingProgress';

type Props = {
  page: number;
  pageCount: number;
  scrollMode: ScrollMode;
  fitMode: FitMode;
  onPrev: () => void;
  onNext: () => void;
  onToggleScrollMode: () => void;
  onToggleFitMode: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
};

export function ReaderControls({
  page,
  pageCount,
  scrollMode,
  fitMode,
  onPrev,
  onNext,
  onToggleScrollMode,
  onToggleFitMode,
  onZoomIn,
  onZoomOut,
}: Props) {
  const progress = formatReadingProgress(page, pageCount);

  return (
    <View style={styles.bar}>
      <View style={styles.row}>
        <Pressable accessibilityRole="button" accessibilityLabel="Previous page" onPress={onPrev} style={styles.btn}>
          <Text style={styles.btnText}>Prev</Text>
        </Pressable>
        <Text style={styles.page}>
          {page} / {pageCount || '—'}
          {progress ? ` · ${progress}` : ''}
        </Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Next page" onPress={onNext} style={styles.btn}>
          <Text style={styles.btnText}>Next</Text>
        </Pressable>
      </View>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Toggle scroll mode"
          onPress={onToggleScrollMode}
          style={styles.chip}>
          <Text style={styles.chipText}>{scrollMode === 'vertical' ? 'Scroll' : 'Paged'}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Toggle fit mode"
          onPress={onToggleFitMode}
          style={styles.chip}>
          <Text style={styles.chipText}>{fitMode === 'width' ? 'Fit width' : 'Fit page'}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Zoom out" onPress={onZoomOut} style={styles.chip}>
          <Text style={styles.chipText}>−</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Zoom in" onPress={onZoomIn} style={styles.chip}>
          <Text style={styles.chipText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#1E2630',
    backgroundColor: 'rgba(15,20,25,0.96)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  page: {
    color: '#F4F1EA',
    fontSize: 14,
    fontWeight: '600',
    minWidth: 72,
    textAlign: 'center',
  },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1E2630',
  },
  btnText: {
    color: '#C4A574',
    fontWeight: '700',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1A222D',
    borderWidth: 1,
    borderColor: '#2A3441',
  },
  chipText: {
    color: '#E8EAED',
    fontSize: 13,
    fontWeight: '600',
  },
});
