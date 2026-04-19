import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

type Option = {
  key: string;
  letter: string;
  title: string;
  description: string;
};

type Shape = {
  key: string;
  name: string;
  details: string;
};

const options: Option[] = [
  {
    key: 'minimal',
    letter: 'A',
    title: 'Minimal Kartlar',
    description: 'Sade kenarliklar ve yumusak tonlar.',
  },
  {
    key: 'vivid',
    letter: 'B',
    title: 'Canli Vurgu',
    description: 'Mavi secim rengi ve belirgin durum gostergesi.',
  },
  {
    key: 'mixed',
    letter: 'C',
    title: 'Karma Sunum',
    description: 'Secenek + sekil kartlarini birlestiren duzen.',
  },
];

const shapes: Shape[] = [
  { key: 'circle', name: 'Daire', details: 'Tam yuvarlak, dengeli vurgu.' },
  { key: 'square', name: 'Kare', details: 'Keskin koselerle guclu gorunum.' },
  { key: 'diamond', name: 'Elmas', details: '45 derece donuk modern form.' },
  { key: 'triangle', name: 'Ucgen', details: 'Yonlendirme hissi veren ikon.' },
];

export default function App() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const palette = useMemo(
    () => ({
      bgPrimary: isDark ? '#1d1d1f' : '#f5f5f7',
      bgSecondary: isDark ? '#2d2d2f' : '#ffffff',
      bgTertiary: isDark ? '#3d3d3f' : '#e5e5e7',
      border: isDark ? '#424245' : '#d1d1d6',
      textPrimary: isDark ? '#f5f5f7' : '#1d1d1f',
      textSecondary: isDark ? '#86868b' : '#6e6e73',
      accent: isDark ? '#0a84ff' : '#0071e3',
      selectedBg: isDark ? 'rgba(10, 132, 255, 0.16)' : '#e8f4fd',
      success: '#34c759',
    }),
    [isDark]
  );

  const [selectedOption, setSelectedOption] = useState(options[0].key);
  const [selectedShape, setSelectedShape] = useState(shapes[0].key);

  return (
    <View style={[styles.container, { backgroundColor: palette.bgPrimary }]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: palette.bgSecondary,
            borderBottomColor: palette.border,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: palette.textSecondary }]}>
          Superpowers Skill Stili
        </Text>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: palette.success }]} />
          <Text style={[styles.statusText, { color: palette.success }]}>Bagli</Text>
        </View>
      </View>

      <ScrollView style={styles.main} contentContainerStyle={styles.mainContent}>
        <Text style={[styles.title, { color: palette.textPrimary }]}>Sekil Galerisi</Text>
        <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
          Referans skill tasarimindaki secenek kartlari ve gosterge yapisi mobil arayuze
          uyarlandi.
        </Text>

        <Text style={[styles.label, { color: palette.textSecondary }]}>Secenekler</Text>
        <View style={styles.optionsList}>
          {options.map((option) => {
            const isSelected = option.key === selectedOption;
            return (
              <Pressable
                key={option.key}
                onPress={() => setSelectedOption(option.key)}
                style={[
                  styles.option,
                  {
                    backgroundColor: isSelected ? palette.selectedBg : palette.bgSecondary,
                    borderColor: isSelected ? palette.accent : palette.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.letter,
                    {
                      backgroundColor: isSelected ? palette.accent : palette.bgTertiary,
                    },
                  ]}
                >
                  <Text style={[styles.letterText, { color: isSelected ? '#fff' : palette.textSecondary }]}>
                    {option.letter}
                  </Text>
                </View>
                <View style={styles.optionContent}>
                  <Text style={[styles.optionTitle, { color: palette.textPrimary }]}>{option.title}</Text>
                  <Text style={[styles.optionDescription, { color: palette.textSecondary }]}>
                    {option.description}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.label, { color: palette.textSecondary, marginTop: 24 }]}>Sekiller</Text>
        <View style={styles.cards}>
          {shapes.map((shape) => {
            const isSelected = shape.key === selectedShape;
            return (
              <Pressable
                key={shape.key}
                onPress={() => setSelectedShape(shape.key)}
                style={[
                  styles.card,
                  {
                    backgroundColor: palette.bgSecondary,
                    borderColor: isSelected ? palette.accent : palette.border,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
              >
                <View style={[styles.cardPreview, { backgroundColor: palette.bgTertiary }]}>
                  <ShapePreview shape={shape.key} color={palette.accent} />
                </View>
                <View style={styles.cardBody}>
                  <Text style={[styles.cardTitle, { color: palette.textPrimary }]}>{shape.name}</Text>
                  <Text style={[styles.cardDetails, { color: palette.textSecondary }]}>
                    {shape.details}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View
        style={[
          styles.indicatorBar,
          {
            backgroundColor: palette.bgSecondary,
            borderTopColor: palette.border,
          },
        ]}
      >
        <Text style={[styles.indicatorText, { color: palette.textSecondary }]}>
          Aktif secim:{' '}
          <Text style={[styles.indicatorSelected, { color: palette.accent }]}>
            {selectedOption.toUpperCase()} /{' '}
            {shapes.find((shape) => shape.key === selectedShape)?.name}
          </Text>
        </Text>
      </View>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </View>
  );
}

function ShapePreview({ shape, color }: { shape: string; color: string }) {
  if (shape === 'circle') {
    return <View style={[styles.circleShape, { borderColor: color }]} />;
  }
  if (shape === 'square') {
    return <View style={[styles.squareShape, { borderColor: color }]} />;
  }
  if (shape === 'diamond') {
    return <View style={[styles.diamondShape, { borderColor: color }]} />;
  }
  return (
    <View
      style={[
        styles.triangleShape,
        {
          borderBottomColor: color,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  main: {
    flex: 1,
  },
  mainContent: {
    padding: 20,
    paddingBottom: 36,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  optionsList: {
    gap: 10,
  },
  option: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  letter: {
    width: 30,
    height: 30,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  letterText: {
    fontWeight: '700',
    fontSize: 13,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  cards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  card: {
    width: '47%',
    borderRadius: 12,
    marginHorizontal: '1.5%',
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardPreview: {
    height: 105,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDetails: {
    fontSize: 12,
    lineHeight: 17,
  },
  indicatorBar: {
    borderTopWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  indicatorText: {
    fontSize: 12,
  },
  indicatorSelected: {
    fontWeight: '700',
  },
  circleShape: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 4,
  },
  squareShape: {
    width: 56,
    height: 56,
    borderWidth: 4,
    borderRadius: 10,
  },
  diamondShape: {
    width: 44,
    height: 44,
    borderWidth: 4,
    transform: [{ rotate: '45deg' }],
  },
  triangleShape: {
    width: 0,
    height: 0,
    borderLeftWidth: 30,
    borderRightWidth: 30,
    borderBottomWidth: 50,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});
