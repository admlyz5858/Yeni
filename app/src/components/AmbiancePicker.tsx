import React from 'react';
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ambiance, ambiances } from '../data/ambiances';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

interface Props {
  visible: boolean;
  activeId: string;
  onClose: () => void;
  onSelect: (id: string) => void;
}

const CATEGORY_LABELS: Record<Ambiance['category'], string> = {
  nature: 'Doğa',
  water: 'Su',
  weather: 'Hava',
  urban: 'Şehir',
  cozy: 'Sıcak',
  abstract: 'Sade',
};

export const AmbiancePicker: React.FC<Props> = ({
  visible,
  activeId,
  onClose,
  onSelect,
}) => {
  const grouped = React.useMemo(() => {
    const map = new Map<Ambiance['category'], Ambiance[]>();
    for (const a of ambiances) {
      const arr = map.get(a.category) ?? [];
      arr.push(a);
      map.set(a.category, arr);
    }
    return Array.from(map.entries());
  }, []);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.headerRow}>
          <Text style={styles.title}>Ambiance Seç</Text>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.closeBtn,
              pressed && { opacity: 0.8 },
            ]}
          >
            <Text style={styles.closeText}>Kapat</Text>
          </Pressable>
        </View>
        <FlatList
          data={grouped}
          keyExtractor={([key]) => key}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item: [cat, list] }) => (
            <View style={{ marginBottom: spacing.md }}>
              <Text style={styles.sectionTitle}>{CATEGORY_LABELS[cat]}</Text>
              <View style={styles.grid}>
                {list.map((a) => {
                  const active = a.id === activeId;
                  return (
                    <Pressable
                      key={a.id}
                      onPress={() => {
                        onSelect(a.id);
                        onClose();
                      }}
                      style={({ pressed }) => [
                        styles.card,
                        {
                          borderColor: active ? a.accent : colors.border,
                          backgroundColor: active
                            ? a.accent + '22'
                            : colors.bgSoft,
                        },
                        pressed && { opacity: 0.85 },
                      ]}
                    >
                      <Text style={styles.emoji}>{a.emoji}</Text>
                      <Text
                        style={[
                          styles.cardTitle,
                          { color: active ? a.accent : colors.text },
                        ]}
                        numberOfLines={1}
                      >
                        {a.title}
                      </Text>
                      <Text style={styles.cardSub} numberOfLines={2}>
                        {a.subtitle}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    maxHeight: '85%',
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  handle: {
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: { color: colors.text, fontSize: 18, fontWeight: '800' },
  closeBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  listContent: { paddingBottom: spacing.lg },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  card: {
    flexBasis: '31%',
    flexGrow: 1,
    minWidth: 100,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  emoji: { fontSize: 28, marginBottom: 4 },
  cardTitle: { fontSize: 13, fontWeight: '700' },
  cardSub: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
});
