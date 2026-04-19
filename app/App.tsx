import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

type Point = {
  x: number;
  y: number;
};

const BOARD_SIZE = 16;
const TICK_MS = 170;

const OPPOSITE_DIRECTION: Record<Direction, Direction> = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
};

const DIRECTION_DELTA: Record<Direction, Point> = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

const getInitialSnake = (): Point[] => [
  { x: 6, y: 8 },
  { x: 5, y: 8 },
  { x: 4, y: 8 },
];

const pointKey = (point: Point): string => `${point.x},${point.y}`;

const randomFood = (snake: Point[]): Point => {
  const occupied = new Set(snake.map(pointKey));
  const freeCells: Point[] = [];

  for (let y = 0; y < BOARD_SIZE; y += 1) {
    for (let x = 0; x < BOARD_SIZE; x += 1) {
      if (!occupied.has(`${x},${y}`)) {
        freeCells.push({ x, y });
      }
    }
  }

  if (freeCells.length === 0) {
    return snake[0];
  }

  const randomIndex = Math.floor(Math.random() * freeCells.length);
  return freeCells[randomIndex];
};

export default function App() {
  const [snake, setSnake] = useState<Point[]>(getInitialSnake);
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [queuedDirection, setQueuedDirection] = useState<Direction | null>(null);
  const [food, setFood] = useState<Point>(() => randomFood(getInitialSnake()));
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const snakeSet = useMemo(() => new Set(snake.map(pointKey)), [snake]);

  const resetGame = useCallback(() => {
    const initialSnake = getInitialSnake();
    setSnake(initialSnake);
    setDirection('RIGHT');
    setQueuedDirection(null);
    setFood(randomFood(initialSnake));
    setIsGameOver(false);
    setScore(0);
  }, []);

  const handleDirectionChange = useCallback(
    (nextDirection: Direction) => {
      if (isGameOver) {
        return;
      }

      const effectiveDirection = queuedDirection ?? direction;
      if (
        nextDirection === effectiveDirection ||
        OPPOSITE_DIRECTION[effectiveDirection] === nextDirection
      ) {
        return;
      }

      setQueuedDirection(nextDirection);
    },
    [direction, isGameOver, queuedDirection],
  );

  useEffect(() => {
    if (isGameOver) {
      return;
    }

    intervalRef.current = setInterval(() => {
      setSnake((previousSnake) => {
        const nextDirection = queuedDirection ?? direction;
        if (queuedDirection) {
          setDirection(queuedDirection);
          setQueuedDirection(null);
        }

        const head = previousSnake[0];
        const delta = DIRECTION_DELTA[nextDirection];
        const newHead: Point = {
          x: head.x + delta.x,
          y: head.y + delta.y,
        };

        const hitWall =
          newHead.x < 0 ||
          newHead.x >= BOARD_SIZE ||
          newHead.y < 0 ||
          newHead.y >= BOARD_SIZE;
        const hitSelf = previousSnake.some(
          (segment) => segment.x === newHead.x && segment.y === newHead.y,
        );

        if (hitWall || hitSelf) {
          setIsGameOver(true);
          return previousSnake;
        }

        const hasEatenFood = newHead.x === food.x && newHead.y === food.y;
        const nextSnake = [newHead, ...previousSnake];

        if (hasEatenFood) {
          setScore((previousScore) => previousScore + 1);
          setFood(randomFood(nextSnake));
          return nextSnake;
        }

        nextSnake.pop();
        return nextSnake;
      });
    }, TICK_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [direction, food.x, food.y, isGameOver, queuedDirection]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Snake</Text>
      <Text style={styles.subtitle}>Skor: {score}</Text>

      <View style={styles.board}>
        {Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, index) => {
          const x = index % BOARD_SIZE;
          const y = Math.floor(index / BOARD_SIZE);
          const key = `${x}-${y}`;
          const isSnake = snakeSet.has(`${x},${y}`);
          const isFood = food.x === x && food.y === y;

          return (
            <View
              key={key}
              style={[
                styles.cell,
                isSnake && styles.snakeCell,
                isFood && styles.foodCell,
              ]}
            />
          );
        })}
      </View>

      {isGameOver ? (
        <View style={styles.gameOverWrapper}>
          <Text style={styles.gameOverText}>Oyun Bitti</Text>
          <Pressable style={styles.restartButton} onPress={resetGame}>
            <Text style={styles.restartButtonText}>Yeniden Başlat</Text>
          </Pressable>
        </View>
      ) : (
        <Text style={styles.helpText}>
          Yön tuşları yerine aşağıdaki butonlarla oynayabilirsiniz.
        </Text>
      )}

      <View style={styles.controls}>
        <Pressable style={styles.controlButton} onPress={() => handleDirectionChange('UP')}>
          <Text style={styles.controlText}>↑</Text>
        </Pressable>
        <View style={styles.horizontalControls}>
          <Pressable style={styles.controlButton} onPress={() => handleDirectionChange('LEFT')}>
            <Text style={styles.controlText}>←</Text>
          </Pressable>
          <Pressable style={styles.controlButton} onPress={() => handleDirectionChange('DOWN')}>
            <Text style={styles.controlText}>↓</Text>
          </Pressable>
          <Pressable style={styles.controlButton} onPress={() => handleDirectionChange('RIGHT')}>
            <Text style={styles.controlText}>→</Text>
          </Pressable>
        </View>
      </View>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  title: {
    color: '#f8fafc',
    fontSize: 34,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  board: {
    width: 320,
    height: 320,
    backgroundColor: '#111827',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#334155',
    flexDirection: 'row',
    flexWrap: 'wrap',
    overflow: 'hidden',
  },
  cell: {
    width: '6.25%',
    height: '6.25%',
    borderWidth: 0.4,
    borderColor: '#1e293b',
  },
  snakeCell: {
    backgroundColor: '#22c55e',
  },
  foodCell: {
    backgroundColor: '#ef4444',
    borderColor: '#7f1d1d',
  },
  helpText: {
    marginTop: 14,
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'center',
  },
  gameOverWrapper: {
    marginTop: 14,
    alignItems: 'center',
    gap: 10,
  },
  gameOverText: {
    color: '#f87171',
    fontSize: 22,
    fontWeight: '800',
  },
  restartButton: {
    backgroundColor: '#22c55e',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  restartButtonText: {
    color: '#032d12',
    fontSize: 15,
    fontWeight: '800',
  },
  controls: {
    marginTop: 14,
    alignItems: 'center',
    gap: 10,
  },
  horizontalControls: {
    flexDirection: 'row',
    gap: 10,
  },
  controlButton: {
    width: 62,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlText: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 28,
  },
});
