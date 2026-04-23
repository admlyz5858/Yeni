import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, ViewStyle } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Ambiance, SceneType } from '../data/ambiances';

interface Props {
  ambiance: Ambiance;
  width: number;
  height: number;
  style?: ViewStyle | ViewStyle[];
  /** Çok parçacık pahalıysa (düşük cihaz) yoğunluk azaltılabilir. */
  density?: number;
}

function seededRandom(seed: number): () => number {
  let s = seed || 1;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export const SceneBackground: React.FC<Props> = ({
  ambiance,
  width,
  height,
  style,
  density = 1,
}) => {
  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        style as ViewStyle,
        { overflow: 'hidden' },
      ]}
    >
      <LinearGradient
        colors={ambiance.gradient as any}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <SceneEffects
        scene={ambiance.scene}
        accent={ambiance.accent}
        width={width}
        height={height}
        density={density}
      />

      {ambiance.horizon && ambiance.horizon !== 'none' && (
        <Horizon
          kind={ambiance.horizon}
          color={ambiance.horizonColor ?? '#000000'}
          width={width}
          height={height}
        />
      )}
    </View>
  );
};

interface EffectProps {
  scene: SceneType;
  accent: string;
  width: number;
  height: number;
  density: number;
}

const SceneEffects: React.FC<EffectProps> = ({
  scene,
  accent,
  width,
  height,
  density,
}) => {
  switch (scene) {
    case 'sunny_forest':
      return (
        <>
          <SunRays width={width} height={height} color="#fde68a" />
          <Leaves width={width} height={height} count={14 * density} />
          <Fireflies width={width} height={height} count={6 * density} color="#fef3c7" />
        </>
      );
    case 'rainy_forest':
      return (
        <>
          <RainDrops width={width} height={height} count={90 * density} />
          <Mist width={width} height={height} opacity={0.25} />
        </>
      );
    case 'forest_stream':
      return (
        <>
          <SunRays width={width} height={height} color="#a7f3d0" />
          <Leaves width={width} height={height} count={10 * density} />
          <Ripples width={width} height={height} count={3} yRatio={0.78} accent="#a7f3d0" />
        </>
      );
    case 'waterfall':
      return (
        <>
          <WaterStreams width={width} height={height} count={60 * density} />
          <Mist width={width} height={height} opacity={0.35} />
          <Ripples width={width} height={height} count={4} yRatio={0.85} accent="#bae6fd" />
        </>
      );
    case 'river_raft':
      return (
        <>
          <SunRays width={width} height={height} color="#bae6fd" />
          <Ripples width={width} height={height} count={5} yRatio={0.7} accent="#bae6fd" />
          <Leaves width={width} height={height} count={8 * density} />
        </>
      );
    case 'sea_waves':
      return (
        <>
          <Sun width={width} height={height} x={0.75} y={0.28} size={80} color="#dbeafe" />
          <WaveLines width={width} height={height} count={6} accent="#93c5fd" />
        </>
      );
    case 'sunset_beach':
      return (
        <>
          <Sun width={width} height={height} x={0.5} y={0.5} size={120} color="#fde68a" />
          <WaveLines width={width} height={height} count={5} accent="#fde68a" />
          <Birds width={width} height={height} count={4} />
        </>
      );
    case 'sea_cove':
      return (
        <>
          <Sun width={width} height={height} x={0.8} y={0.18} size={70} color="#fef9c3" />
          <WaveLines width={width} height={height} count={4} accent="#7dd3fc" />
          <Birds width={width} height={height} count={3} />
        </>
      );
    case 'fireplace':
      return (
        <>
          <FireGlow width={width} height={height} />
          <Embers width={width} height={height} count={26 * density} />
        </>
      );
    case 'snow_forest':
      return (
        <>
          <Snow width={width} height={height} count={80 * density} />
          <Moon width={width} height={height} x={0.75} y={0.22} size={60} color="#e0e7ff" />
        </>
      );
    case 'snow_mountain':
      return (
        <>
          <Snow width={width} height={height} count={55 * density} slow />
          <CloudsDrift width={width} height={height} count={5} />
        </>
      );
    case 'misty_rain':
      return (
        <>
          <RainDrops width={width} height={height} count={70 * density} />
          <Mist width={width} height={height} opacity={0.45} />
        </>
      );
    case 'pier':
      return (
        <>
          <Sun width={width} height={height} x={0.82} y={0.25} size={60} color="#e0f2fe" />
          <WaveLines width={width} height={height} count={5} accent="#bae6fd" />
          <Birds width={width} height={height} count={5} />
        </>
      );
    case 'coast':
      return (
        <>
          <Sun width={width} height={height} x={0.75} y={0.2} size={70} color="#ccfbf1" />
          <WaveLines width={width} height={height} count={6} accent="#99f6e4" />
        </>
      );
    case 'sunset_field':
      return (
        <>
          <Sun width={width} height={height} x={0.5} y={0.55} size={110} color="#fde68a" />
          <Grass width={width} height={height} count={14 * density} accent="#fcd34d" />
          <Fireflies width={width} height={height} count={6 * density} color="#fbbf24" />
        </>
      );
    case 'silent_night':
    default:
      return (
        <>
          <Moon width={width} height={height} x={0.78} y={0.22} size={70} color="#c7d2fe" />
          <Stars width={width} height={height} count={70 * density} />
        </>
      );
  }
};

/* ---------- Yardımcılar ---------- */

const Sun: React.FC<{
  width: number;
  height: number;
  x: number;
  y: number;
  size: number;
  color: string;
}> = ({ width, height, x, y, size, color }) => {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.06,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulse]);
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x * width - size,
        top: y * height - size,
        width: size * 2,
        height: size * 2,
        transform: [{ scale: pulse }],
      }}
    >
      <Svg width={size * 2} height={size * 2}>
        <Defs>
          <RadialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color} stopOpacity={1} />
            <Stop offset="50%" stopColor={color} stopOpacity={0.35} />
            <Stop offset="100%" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={size} cy={size} r={size} fill="url(#sunGrad)" />
        <Circle cx={size} cy={size} r={size / 2.4} fill={color} opacity={0.9} />
      </Svg>
    </Animated.View>
  );
};

const Moon = Sun;

const SunRays: React.FC<{ width: number; height: number; color: string }> = ({
  width,
  height,
  color,
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.55,
          duration: 6000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.25,
          duration: 6000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [opacity]);
  return (
    <Animated.View
      style={{ position: 'absolute', width, height, opacity }}
      pointerEvents="none"
    >
      <Svg width={width} height={height}>
        <Defs>
          <SvgLinearGradient id="rayGrad" x1="0.5" y1="0" x2="0.5" y2="1">
            <Stop offset="0%" stopColor={color} stopOpacity={0.55} />
            <Stop offset="100%" stopColor={color} stopOpacity={0} />
          </SvgLinearGradient>
        </Defs>
        {[0.15, 0.35, 0.6, 0.82].map((xr, i) => {
          const topX = xr * width;
          const bottomX = topX + (i % 2 === 0 ? 120 : -120);
          return (
            <Path
              key={i}
              d={`M${topX - 40} 0 L${topX + 40} 0 L${bottomX + 25} ${height} L${bottomX - 25} ${height} Z`}
              fill="url(#rayGrad)"
            />
          );
        })}
      </Svg>
    </Animated.View>
  );
};

interface LeavesProps {
  width: number;
  height: number;
  count: number;
}
const Leaves: React.FC<LeavesProps> = ({ width, height, count }) => {
  const leaves = useMemo(() => {
    const rand = seededRandom(11);
    return Array.from({ length: Math.floor(count) }, (_, i) => ({
      id: i,
      x: rand() * width,
      size: 8 + rand() * 10,
      delay: rand() * 8000,
      duration: 8000 + rand() * 8000,
      drift: (rand() - 0.5) * 120,
      rotation: rand() * 360,
      opacity: 0.6 + rand() * 0.35,
      hue: rand() > 0.5 ? '#86efac' : '#fde68a',
    }));
  }, [count, width]);
  return (
    <View style={[StyleSheet.absoluteFill]} pointerEvents="none">
      {leaves.map((l) => (
        <Leaf key={l.id} {...l} height={height} />
      ))}
    </View>
  );
};

const Leaf: React.FC<{
  x: number;
  size: number;
  delay: number;
  duration: number;
  drift: number;
  rotation: number;
  opacity: number;
  hue: string;
  height: number;
}> = ({ x, size, delay, duration, drift, rotation, opacity, hue, height }) => {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(progress, {
          toValue: 1,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [progress, delay, duration]);
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, height + 40],
  });
  const translateX = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, drift, 0],
  });
  const rotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [`${rotation}deg`, `${rotation + 360}deg`],
  });
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x,
        top: 0,
        width: size,
        height: size,
        opacity,
        transform: [{ translateY }, { translateX }, { rotate }],
      }}
    >
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
          d="M17 8C8 10 5 15 3 22c8-2 14-5 19-14 1-1.5 1.5-3 1-4.5-2-.5-5 .5-6 4.5z"
          fill={hue}
          opacity={0.95}
        />
      </Svg>
    </Animated.View>
  );
};

const RainDrops: React.FC<{
  width: number;
  height: number;
  count: number;
}> = ({ width, height, count }) => {
  const drops = useMemo(() => {
    const rand = seededRandom(41);
    return Array.from({ length: Math.floor(count) }, (_, i) => ({
      id: i,
      x: rand() * width,
      length: 14 + rand() * 18,
      duration: 700 + rand() * 900,
      delay: rand() * 1200,
      opacity: 0.25 + rand() * 0.4,
    }));
  }, [count, width]);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {drops.map((d) => (
        <RainDrop key={d.id} {...d} height={height} />
      ))}
    </View>
  );
};

const RainDrop: React.FC<{
  x: number;
  length: number;
  duration: number;
  delay: number;
  opacity: number;
  height: number;
}> = ({ x, length, duration, delay, opacity, height }) => {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(progress, {
          toValue: 1,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [progress, delay, duration]);
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, height + length],
  });
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x,
        top: 0,
        width: 2,
        height: length,
        backgroundColor: '#cbd5e1',
        opacity,
        transform: [{ translateY }],
        borderRadius: 1,
      }}
    />
  );
};

const Snow: React.FC<{
  width: number;
  height: number;
  count: number;
  slow?: boolean;
}> = ({ width, height, count, slow }) => {
  const flakes = useMemo(() => {
    const rand = seededRandom(77);
    return Array.from({ length: Math.floor(count) }, (_, i) => ({
      id: i,
      x: rand() * width,
      size: 2 + rand() * 4,
      drift: (rand() - 0.5) * (slow ? 80 : 150),
      duration: (slow ? 14000 : 8000) + rand() * 7000,
      delay: rand() * 8000,
      opacity: 0.4 + rand() * 0.5,
    }));
  }, [count, width, slow]);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {flakes.map((f) => (
        <Snowflake key={f.id} {...f} height={height} />
      ))}
    </View>
  );
};

const Snowflake: React.FC<{
  x: number;
  size: number;
  drift: number;
  duration: number;
  delay: number;
  opacity: number;
  height: number;
}> = ({ x, size, drift, duration, delay, opacity, height }) => {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(progress, {
          toValue: 1,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [progress, delay, duration]);
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, height + 20],
  });
  const translateX = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, drift, 0],
  });
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x,
        top: 0,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#e0f2fe',
        opacity,
        transform: [{ translateY }, { translateX }],
      }}
    />
  );
};

const Embers: React.FC<{
  width: number;
  height: number;
  count: number;
}> = ({ width, height, count }) => {
  const items = useMemo(() => {
    const rand = seededRandom(99);
    return Array.from({ length: Math.floor(count) }, (_, i) => ({
      id: i,
      x: width * 0.25 + rand() * width * 0.5,
      size: 3 + rand() * 5,
      delay: rand() * 4000,
      duration: 3500 + rand() * 3500,
      drift: (rand() - 0.5) * 40,
      hue: rand() > 0.6 ? '#fde68a' : '#fb923c',
    }));
  }, [count, width]);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {items.map((e) => (
        <Ember key={e.id} {...e} height={height} />
      ))}
    </View>
  );
};

const Ember: React.FC<{
  x: number;
  size: number;
  delay: number;
  duration: number;
  drift: number;
  hue: string;
  height: number;
}> = ({ x, size, delay, duration, drift, hue, height }) => {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(progress, {
          toValue: 1,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [progress, delay, duration]);
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [height * 0.85, -50],
  });
  const translateX = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, drift, 0],
  });
  const opacity = progress.interpolate({
    inputRange: [0, 0.1, 0.8, 1],
    outputRange: [0, 1, 0.7, 0],
  });
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x,
        top: 0,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: hue,
        opacity,
        transform: [{ translateY }, { translateX }],
        shadowColor: hue,
        shadowOpacity: 0.9,
        shadowRadius: size,
      }}
    />
  );
};

const FireGlow: React.FC<{ width: number; height: number }> = ({
  width,
  height,
}) => {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ]),
    ).start();
  }, [pulse]);
  const radiusY = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [height * 0.42, height * 0.5],
  });
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: -40,
        height: radiusY as any,
      }}
      pointerEvents="none"
    >
      <Svg width={width} height={height}>
        <Defs>
          <RadialGradient id="glow" cx="50%" cy="100%" r="70%">
            <Stop offset="0%" stopColor="#fde047" stopOpacity={0.8} />
            <Stop offset="35%" stopColor="#f97316" stopOpacity={0.55} />
            <Stop offset="80%" stopColor="#7c2d12" stopOpacity={0.1} />
            <Stop offset="100%" stopColor="#7c2d12" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={width} height={height} fill="url(#glow)" />
      </Svg>
    </Animated.View>
  );
};

const Fireflies: React.FC<{
  width: number;
  height: number;
  count: number;
  color: string;
}> = ({ width, height, count, color }) => {
  const items = useMemo(() => {
    const rand = seededRandom(53);
    return Array.from({ length: Math.floor(count) }, (_, i) => ({
      id: i,
      x: rand() * width,
      y: (0.45 + rand() * 0.4) * height,
      size: 3 + rand() * 3,
      delay: rand() * 4000,
      duration: 3500 + rand() * 3500,
      driftX: (rand() - 0.5) * 90,
      driftY: (rand() - 0.5) * 60,
    }));
  }, [count, width, height]);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {items.map((f) => (
        <Firefly key={f.id} {...f} color={color} />
      ))}
    </View>
  );
};

const Firefly: React.FC<{
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  driftX: number;
  driftY: number;
  color: string;
}> = ({ x, y, size, delay, duration, driftX, driftY, color }) => {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(progress, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [progress, delay, duration]);
  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, driftX],
  });
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, driftY],
  });
  const opacity = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.9, 0.3],
  });
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        shadowColor: color,
        shadowOpacity: 0.9,
        shadowRadius: size * 2,
        opacity,
        transform: [{ translateX }, { translateY }],
      }}
    />
  );
};

const Mist: React.FC<{ width: number; height: number; opacity: number }> = ({
  width,
  height,
  opacity,
}) => {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 18000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [progress]);
  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 0.3],
  });
  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: height * 0.4,
        left: -width * 0.3,
        width: width * 2,
        height: height * 0.45,
        transform: [{ translateX }],
        opacity,
      }}
      pointerEvents="none"
    >
      <Svg width={width * 2} height={height * 0.45}>
        <Defs>
          <SvgLinearGradient id="mist" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#e2e8f0" stopOpacity={0} />
            <Stop offset="50%" stopColor="#e2e8f0" stopOpacity={0.8} />
            <Stop offset="100%" stopColor="#e2e8f0" stopOpacity={0} />
          </SvgLinearGradient>
        </Defs>
        <Rect
          x={0}
          y={0}
          width={width * 2}
          height={height * 0.45}
          fill="url(#mist)"
        />
      </Svg>
    </Animated.View>
  );
};

const WaterStreams: React.FC<{
  width: number;
  height: number;
  count: number;
}> = ({ width, height, count }) => {
  const items = useMemo(() => {
    const rand = seededRandom(121);
    return Array.from({ length: Math.floor(count) }, (_, i) => ({
      id: i,
      x: (i / count) * width + rand() * 6,
      width: 3 + rand() * 4,
      duration: 900 + rand() * 900,
      delay: rand() * 1500,
      opacity: 0.25 + rand() * 0.45,
    }));
  }, [count, width]);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {items.map((s) => (
        <WaterStream key={s.id} {...s} height={height} />
      ))}
    </View>
  );
};

const WaterStream: React.FC<{
  x: number;
  width: number;
  duration: number;
  delay: number;
  opacity: number;
  height: number;
}> = ({ x, width, duration, delay, opacity, height }) => {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(progress, {
          toValue: 1,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [progress, delay, duration]);
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-80, height * 0.9],
  });
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x,
        top: 0,
        width,
        height: 80,
        backgroundColor: '#e0f2fe',
        opacity,
        borderRadius: width / 2,
        transform: [{ translateY }],
      }}
    />
  );
};

const WaveLines: React.FC<{
  width: number;
  height: number;
  count: number;
  accent: string;
}> = ({ width, height, count, accent }) => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: count }).map((_, i) => (
        <WaveLine
          key={i}
          idx={i}
          total={count}
          width={width}
          height={height}
          accent={accent}
        />
      ))}
    </View>
  );
};

const WaveLine: React.FC<{
  idx: number;
  total: number;
  width: number;
  height: number;
  accent: string;
}> = ({ idx, total, width, height, accent }) => {
  const phase = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(phase, {
        toValue: 1,
        duration: 5000 + idx * 400,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [phase, idx]);
  const translateX = phase.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width],
  });
  const yBase = 0.55 + (idx / total) * 0.4;
  const waveHeight = 16 + idx * 3;
  const opacity = 0.22 + idx * 0.08;
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: -width,
        top: yBase * height - waveHeight,
        width: width * 2,
        height: waveHeight * 2,
        transform: [{ translateX }],
        opacity,
      }}
    >
      <Svg width={width * 2} height={waveHeight * 2}>
        <Path
          d={`M0 ${waveHeight} Q${width * 0.5} 0 ${width} ${waveHeight} T${width * 2} ${waveHeight} L${width * 2} ${waveHeight * 2} L0 ${waveHeight * 2} Z`}
          fill={accent}
          opacity={0.85}
        />
      </Svg>
    </Animated.View>
  );
};

const Ripples: React.FC<{
  width: number;
  height: number;
  count: number;
  yRatio: number;
  accent: string;
}> = ({ width, height, count, yRatio, accent }) => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: count }).map((_, i) => (
        <Ripple
          key={i}
          idx={i}
          width={width}
          top={height * yRatio}
          accent={accent}
        />
      ))}
    </View>
  );
};

const Ripple: React.FC<{
  idx: number;
  width: number;
  top: number;
  accent: string;
}> = ({ idx, width, top, accent }) => {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(idx * 1800),
        Animated.timing(progress, {
          toValue: 1,
          duration: 4800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [progress, idx]);
  const scale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 3],
  });
  const opacity = progress.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 0.6, 0],
  });
  const size = 80;
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: width * 0.2 + idx * width * 0.2,
        top: top - size / 2,
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1.5,
        borderColor: accent,
        transform: [{ scale }],
        opacity,
      }}
    />
  );
};

const Birds: React.FC<{ width: number; height: number; count: number }> = ({
  width,
  height,
  count,
}) => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: count }).map((_, i) => (
        <Bird key={i} idx={i} width={width} height={height} />
      ))}
    </View>
  );
};

const Bird: React.FC<{ idx: number; width: number; height: number }> = ({
  idx,
  width,
  height,
}) => {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(idx * 3000),
        Animated.timing(progress, {
          toValue: 1,
          duration: 12000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [progress, idx]);
  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-60, width + 60],
  });
  const translateY = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [
      height * (0.2 + idx * 0.04),
      height * (0.18 + idx * 0.04),
      height * (0.22 + idx * 0.04),
    ],
  });
  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: 28,
        height: 10,
        transform: [{ translateX }, { translateY }],
      }}
    >
      <Svg width={28} height={10} viewBox="0 0 28 10">
        <Path
          d="M2 7 Q7 0 14 6 Q21 0 26 7"
          stroke="#f8fafc"
          strokeWidth={1.5}
          fill="none"
          opacity={0.7}
        />
      </Svg>
    </Animated.View>
  );
};

const CloudsDrift: React.FC<{
  width: number;
  height: number;
  count: number;
}> = ({ width, height, count }) => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: count }).map((_, i) => (
        <Cloud key={i} idx={i} width={width} height={height} />
      ))}
    </View>
  );
};

const Cloud: React.FC<{ idx: number; width: number; height: number }> = ({
  idx,
  width,
  height,
}) => {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 40000 + idx * 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [progress, idx]);
  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-240, width + 240],
  });
  const y = height * (0.15 + ((idx * 0.13) % 0.45));
  const size = 160 + (idx % 3) * 50;
  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: y,
        width: size,
        height: size * 0.45,
        opacity: 0.55,
        transform: [{ translateX }],
      }}
    >
      <Svg width={size} height={size * 0.45} viewBox="0 0 100 40">
        <Path
          d="M10 30 Q0 20 15 18 Q15 8 30 10 Q35 0 50 6 Q65 0 72 10 Q90 8 88 20 Q98 25 85 32 L14 32 Q5 32 10 30 Z"
          fill="#e2e8f0"
        />
      </Svg>
    </Animated.View>
  );
};

const Grass: React.FC<{
  width: number;
  height: number;
  count: number;
  accent: string;
}> = ({ width, height, count, accent }) => {
  const blades = useMemo(() => {
    const rand = seededRandom(33);
    return Array.from({ length: Math.floor(count) }, (_, i) => ({
      id: i,
      x: (i / count) * width + rand() * 10,
      heightRatio: 0.18 + rand() * 0.12,
      delay: rand() * 3000,
    }));
  }, [count, width]);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {blades.map((b) => (
        <GrassBlade
          key={b.id}
          x={b.x}
          heightPx={height * b.heightRatio}
          bottom={0}
          delay={b.delay}
          accent={accent}
        />
      ))}
    </View>
  );
};

const GrassBlade: React.FC<{
  x: number;
  heightPx: number;
  bottom: number;
  delay: number;
  accent: string;
}> = ({ x, heightPx, bottom, delay, accent }) => {
  const sway = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(sway, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(sway, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [sway, delay]);
  const rotate = sway.interpolate({
    inputRange: [0, 1],
    outputRange: ['-6deg', '6deg'],
  });
  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom,
        left: x,
        width: 3,
        height: heightPx,
        backgroundColor: accent,
        borderTopLeftRadius: 2,
        borderTopRightRadius: 2,
        opacity: 0.65,
        transform: [{ translateY: heightPx / 2 }, { rotate }, { translateY: -heightPx / 2 }],
      }}
    />
  );
};

const Stars: React.FC<{
  width: number;
  height: number;
  count: number;
}> = ({ width, height, count }) => {
  const stars = useMemo(() => {
    const rand = seededRandom(5);
    return Array.from({ length: Math.floor(count) }, (_, i) => ({
      id: i,
      x: rand() * width,
      y: rand() * height * 0.75,
      size: 1 + rand() * 2.2,
      delay: rand() * 4000,
      duration: 2000 + rand() * 3000,
    }));
  }, [count, width, height]);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {stars.map((s) => (
        <Star key={s.id} {...s} />
      ))}
    </View>
  );
};

const Star: React.FC<{
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}> = ({ x, y, size, delay, duration }) => {
  const progress = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(progress, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0.4,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [progress, delay, duration]);
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#f8fafc',
        opacity: progress,
      }}
    />
  );
};

/* ---------- Ufuk siluetleri ---------- */

const Horizon: React.FC<{
  kind: 'trees' | 'mountains' | 'hills' | 'waves' | 'dunes';
  color: string;
  width: number;
  height: number;
}> = ({ kind, color, width, height }) => {
  const silhouetteHeight = height * 0.35;
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: silhouetteHeight,
      }}
    >
      <Svg width={width} height={silhouetteHeight} viewBox={`0 0 ${width} ${silhouetteHeight}`}>
        <Path d={pathFor(kind, width, silhouetteHeight)} fill={color} />
      </Svg>
    </View>
  );
};

function pathFor(
  kind: 'trees' | 'mountains' | 'hills' | 'waves' | 'dunes',
  w: number,
  h: number,
): string {
  const bottom = h;
  if (kind === 'trees') {
    // Kesişen üçgen ağaçlar
    const trees = 22;
    const step = w / trees;
    let d = `M0 ${bottom} L0 ${h * 0.75}`;
    for (let i = 0; i < trees; i++) {
      const x = i * step;
      const topH = h * (0.35 + ((i * 31) % 100) / 400);
      d += ` L${x + step / 2} ${h * 0.75 - topH}`;
      d += ` L${x + step} ${h * 0.75}`;
    }
    d += ` L${w} ${bottom} Z`;
    return d;
  }
  if (kind === 'mountains') {
    const peaks = 6;
    const step = w / peaks;
    let d = `M0 ${bottom} L0 ${h * 0.55}`;
    for (let i = 0; i < peaks; i++) {
      const x = i * step;
      const peak = h * (0.1 + ((i * 47) % 100) / 300);
      d += ` L${x + step / 2} ${peak} L${x + step} ${h * 0.55}`;
    }
    d += ` L${w} ${bottom} Z`;
    return d;
  }
  if (kind === 'hills') {
    return `M0 ${bottom} L0 ${h * 0.55} Q${w * 0.25} ${h * 0.35} ${w * 0.5} ${h * 0.55} T${w} ${h * 0.55} L${w} ${bottom} Z`;
  }
  if (kind === 'waves') {
    return `M0 ${bottom} L0 ${h * 0.7} Q${w * 0.25} ${h * 0.6} ${w * 0.5} ${h * 0.7} T${w} ${h * 0.7} L${w} ${bottom} Z`;
  }
  // dunes
  return `M0 ${bottom} L0 ${h * 0.65} Q${w * 0.3} ${h * 0.45} ${w * 0.6} ${h * 0.6} T${w} ${h * 0.55} L${w} ${bottom} Z`;
}
