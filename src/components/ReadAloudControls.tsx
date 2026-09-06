import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Speech from 'expo-speech';
import type { ThemeTokens } from '@/src/theme/readingThemes';

type Props = {
  theme: ThemeTokens;
  page: number;
  pageCount: number;
  text: string;
  onRequestText: () => void;
  onNextPage: () => void;
};

export function ReadAloudControls({
  theme, page, pageCount, text, onRequestText, onNextPage,
}: Props) {
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(1);
  const spokenKey = useRef('');

  useEffect(() => {
    if (!playing) return;
    if (!text) {
      onRequestText();
      return;
    }
    const key = `${page}:${rate}:${text.length}`;
    if (spokenKey.current === key) return;
    spokenKey.current = key;
    Speech.stop().then(() => {
      Speech.speak(text.slice(0, Speech.maxSpeechInputLength), {
        rate,
        onDone: () => {
          if (page < pageCount) onNextPage();
          else setPlaying(false);
        },
        onError: () => setPlaying(false),
      });
    });
  }, [onNextPage, onRequestText, page, pageCount, playing, rate, text]);

  useEffect(() => () => {
    Speech.stop().catch(() => undefined);
  }, []);

  const toggle = () => {
    if (playing) {
      setPlaying(false);
      spokenKey.current = '';
      Speech.stop().catch(() => undefined);
    } else {
      setPlaying(true);
      onRequestText();
    }
  };

  return (
    <View style={[styles.row, { borderTopColor: theme.border }]}>
      <Text style={[styles.label, { color: theme.textMuted }]}>Read aloud</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={playing ? 'Stop reading aloud' : 'Start reading aloud'}
        onPress={toggle}
        style={[styles.button, { backgroundColor: playing ? theme.accent : theme.surface, borderColor: theme.border }]}>
        <Text style={{ color: playing ? theme.background : theme.text, fontWeight: '700' }}>
          {playing ? 'Stop' : 'Play'}
        </Text>
      </Pressable>
      {[0.8, 1, 1.25].map((speed) => (
        <Pressable
          key={speed}
          accessibilityRole="button"
          accessibilityLabel={`Reading speed ${speed}`}
          onPress={() => {
            spokenKey.current = '';
            setRate(speed);
          }}
          style={[styles.speed, { borderColor: rate === speed ? theme.accent : theme.border }]}>
          <Text style={{ color: rate === speed ? theme.accent : theme.textMuted }}>{speed}×</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 9, borderTopWidth: 1 },
  label: { fontSize: 12, fontWeight: '700', marginRight: 2 },
  button: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  speed: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 8 },
});
