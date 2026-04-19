import React from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { colors } from '../theme/colors';

interface Props {
  uri: string | null;
  style?: ViewStyle | ViewStyle[];
  tint?: string;
  overlayOpacity?: number;
}

export const VideoBackground: React.FC<Props> = ({
  uri,
  style,
  tint = colors.bg,
  overlayOpacity = 0.55,
}) => {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  if (!uri) {
    return (
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: tint },
          style as ViewStyle,
        ]}
      />
    );
  }

  if (Platform.OS === 'web') {
    return (
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: tint },
          style as ViewStyle,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: tint },
        style as ViewStyle,
      ]}
    >
      <VideoView
        style={StyleSheet.absoluteFill}
        player={player}
        contentFit="cover"
        nativeControls={false}
        allowsPictureInPicture={false}
      />
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: tint, opacity: overlayOpacity },
        ]}
      />
    </View>
  );
};
