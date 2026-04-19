import React from 'react';
import { StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

interface Props extends ViewProps {
  style?: ViewStyle | ViewStyle[];
  padded?: boolean;
}

export const Card: React.FC<Props> = ({ children, style, padded = true, ...rest }) => {
  return (
    <View
      style={[
        styles.card,
        padded && { padding: spacing.lg },
        style as ViewStyle,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
