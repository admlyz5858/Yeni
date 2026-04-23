import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.warn('[ErrorBoundary]', error?.message, info?.componentStack);
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <View style={styles.root}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.emoji}>⚠️</Text>
            <Text style={styles.title}>Bir şeyler ters gitti</Text>
            <Text style={styles.muted}>
              Uygulamada beklenmeyen bir hata oluştu. Lütfen tekrar dene.
            </Text>
            <View style={styles.errBox}>
              <Text style={styles.errText} selectable>
                {this.state.error.message}
              </Text>
            </View>
            <Pressable onPress={this.reset} style={styles.btn}>
              <Text style={styles.btnText}>Yeniden Dene</Text>
            </Pressable>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
    alignItems: 'center',
  },
  emoji: { fontSize: 48 },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  muted: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  errBox: {
    backgroundColor: colors.bgSoft,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    maxWidth: 400,
  },
  errText: {
    color: colors.danger,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  btn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.md,
  },
  btnText: { color: colors.white, fontWeight: '700', fontSize: 15 },
});
