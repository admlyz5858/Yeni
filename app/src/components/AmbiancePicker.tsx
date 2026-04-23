import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Ambiance,
  AmbianceCategory,
  CATEGORY_META,
  ambiances,
} from '../data/ambiances';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

interface Props {
  visible: boolean;
  activeId: string;
  onClose: () => void;
  onSelect: (id: string) => void;
}

const CATEGORY_ORDER: AmbianceCategory[] = [
  'calisma',
  'gece',
  'doga',
  'su',
  'sicak',
  'sessiz',
];

export const AmbiancePicker: React.FC<Props> = ({
  visible,
  activeId,
  onClose,
  onSelect,
}) => {
  const [activeCategory, setActiveCategory] = useState<AmbianceCategory | 'hepsi'>('hepsi');
  const slideAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 65,
        friction: 10,
      }).start();
    } else {
      slideAnim.setValue(0);
    }
  }, [visible, slideAnim]);

  const filtered = useMemo(() => {
    if (activeCategory === 'hepsi') return ambiances;
    return ambiances.filter((a) => a.category === activeCategory);
  }, [activeCategory]);

  const activeAmbiance = useMemo(
    () => ambiances.find((a) => a.id === activeId),
    [activeId],
  );

  const handleSelect = useCallback(
    (id: string) => {
      onSelect(id);
      onClose();
    },
    [onSelect, onClose],
  );

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      {/* Sheet */}
      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Ambiance Seç</Text>
            <Text style={styles.headerSub}>
              {filtered.length} sahne
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.closeBtn,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.closeBtnText}>✕</Text>
          </Pressable>
        </View>

        {/* Aktif Sahne Bandı */}
        {activeAmbiance && (
          <View
            style={[
              styles.activeBanner,
              { borderLeftColor: activeAmbiance.accent },
            ]}
          >
            <Text style={styles.activeBannerEmoji}>{activeAmbiance.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.activeBannerLabel}>Şu an çalıyor</Text>
              <Text
                style={[styles.activeBannerTitle, { color: activeAmbiance.accent }]}
              >
                {activeAmbiance.title}
              </Text>
            </View>
            <View
              style={[
                styles.activeDot,
                { backgroundColor: activeAmbiance.accent },
              ]}
            />
          </View>
        )}

        {/* Kategori Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillRow}
          style={{ flexGrow: 0 }}
        >
          <Pill
            label="Hepsi"
            emoji="🎵"
            active={activeCategory === 'hepsi'}
            accent={colors.primary}
            onPress={() => setActiveCategory('hepsi')}
          />
          {CATEGORY_ORDER.map((cat) => {
            const meta = CATEGORY_META[cat];
            return (
              <Pill
                key={cat}
                label={meta.label}
                emoji={meta.emoji}
                active={activeCategory === cat}
                accent={meta.accent}
                onPress={() => setActiveCategory(cat)}
              />
            );
          })}
        </ScrollView>

        {/* Kart Listesi */}
        <FlatList
          data={filtered}
          keyExtractor={(a) => a.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.gridRow}
          renderItem={({ item }) => (
            <AmbianceCard
              ambiance={item}
              active={item.id === activeId}
              onPress={() => handleSelect(item.id)}
            />
          )}
        />
      </Animated.View>
    </Modal>
  );
};

/* ── Pill ───────────────────────────────────────────────── */
interface PillProps {
  label: string;
  emoji: string;
  active: boolean;
  accent: string;
  onPress: () => void;
}

const Pill: React.FC<PillProps> = ({ label, emoji, active, accent, onPress }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.pill,
      active && { backgroundColor: accent + '28', borderColor: accent },
      pressed && { opacity: 0.75 },
    ]}
  >
    <Text style={styles.pillEmoji}>{emoji}</Text>
    <Text
      style={[
        styles.pillText,
        { color: active ? accent : colors.textMuted },
      ]}
    >
      {label}
    </Text>
  </Pressable>
);

/* ── Ambiance Card ──────────────────────────────────────── */
interface CardProps {
  ambiance: Ambiance;
  active: boolean;
  onPress: () => void;
}

const AmbianceCard: React.FC<CardProps> = ({ ambiance, active, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () =>
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 200,
      friction: 10,
    }).start();

  const onPressOut = () =>
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 200,
      friction: 10,
    }).start();

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <Animated.View
        style={[
          styles.card,
          active && {
            borderColor: ambiance.accent,
            backgroundColor: ambiance.accent + '18',
          },
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        {/* Arka plan aksan */}
        {active && (
          <View
            pointerEvents="none"
            style={[
              styles.cardGlow,
              { backgroundColor: ambiance.accent + '10' },
            ]}
          />
        )}

        {/* Aktif rozet */}
        {active && (
          <View style={[styles.activeBadge, { backgroundColor: ambiance.accent }]}>
            <Text style={styles.activeBadgeText}>▶</Text>
          </View>
        )}

        {/* İkon + içerik */}
        <Text style={styles.cardEmoji}>{ambiance.emoji}</Text>
        <Text
          style={[
            styles.cardTitle,
            { color: active ? ambiance.accent : colors.text },
          ]}
          numberOfLines={1}
        >
          {ambiance.title}
        </Text>
        <Text style={styles.cardSub} numberOfLines={2}>
          {ambiance.subtitle}
        </Text>

        {/* Kategori etiket */}
        <View
          style={[
            styles.categoryTag,
            { backgroundColor: ambiance.accent + '22' },
          ]}
        >
          <Text style={[styles.categoryTagText, { color: ambiance.accent }]}>
            {CATEGORY_META[ambiance.category].label}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
};

/* ── Styles ─────────────────────────────────────────────── */
const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '88%',
    borderTopWidth: 1,
    borderColor: colors.border,
    // Subtle top glow
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 24,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSub: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },

  // Aktif sahne bandı
  activeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.bgSoft,
    borderRadius: radius.md,
    borderLeftWidth: 3,
    gap: spacing.sm,
  },
  activeBannerEmoji: { fontSize: 24 },
  activeBannerLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  activeBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 1,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Kategori pills
  pillRow: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgSoft,
  },
  pillEmoji: { fontSize: 13 },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Kart grid
  grid: {
    paddingHorizontal: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingTop: spacing.xs,
  },
  gridRow: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  card: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.bgSoft,
    minHeight: 130,
    overflow: 'hidden',
  },
  cardGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.lg,
  },
  activeBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '900',
  },
  cardEmoji: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  cardSub: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
    flex: 1,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.pill,
    marginTop: spacing.sm,
  },
  categoryTagText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
