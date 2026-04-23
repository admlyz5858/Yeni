import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface Props {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle | ViewStyle[];
  fullWidth?: boolean;
}

export const Button: React.FC<Props> = ({
  title,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style,
  fullWidth,
}) => {
  const variantStyles = getVariantStyles(variant);
  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        variantStyles.container,
        fullWidth && { alignSelf: 'stretch' },
        pressed && !disabled && { opacity: 0.85 },
        disabled && { opacity: 0.5 },
        style as ViewStyle,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.text.color as string} />
      ) : (
        <Text style={[styles.text, variantStyles.text]}>{title}</Text>
      )}
    </Pressable>
  );
};

function getVariantStyles(variant: Variant) {
  switch (variant) {
    case 'secondary':
      return {
        container: { backgroundColor: colors.bgSoft, borderWidth: 1, borderColor: colors.border },
        text: { color: colors.text },
      };
    case 'ghost':
      return {
        container: { backgroundColor: 'transparent' },
        text: { color: colors.primary },
      };
    case 'danger':
      return {
        container: { backgroundColor: colors.danger },
        text: { color: colors.white },
      };
    case 'primary':
    default:
      return {
        container: { backgroundColor: colors.primary },
        text: { color: colors.white },
      };
  }
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
  },
});
