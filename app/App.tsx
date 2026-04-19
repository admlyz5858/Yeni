import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useReducer } from 'react';
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

const KEY_TO_DIRECTION: Record<string, Direction> = {
  ArrowUp: 'UP',
  ArrowDown: 'DOWN',
  ArrowLeft: 'LEFT',
  ArrowRight: 'RIGHT',
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

const appendDebugLog = (
  hypothesisId: string,
  location: string,
  message: string,
  data: Record<string, unknown>,
): void => {
  const payload = { hypothesisId, location, message, data, timestamp: Date.now() };
  try {
    const dynamicRequire = (0, eval)('typeof require !== "undefined" ? require : null') as
      | ((name: string) => { appendFileSync: (path: string, content: string) => void })
      | null;
    if (dynamicRequire) {
      dynamicRequire('fs').appendFileSync('/opt/cursor/logs/debug.log', `${JSON.stringify(payload)}\n`);
      return;
    }
  } catch {
    // no-op fallback below
  }
  if (typeof console !== 'undefined') {
    console.log('__AGENT_DEBUG__', JSON.stringify(payload));
  }
};

type GameState = {
  snake: Point[];
  direction: Direction;
  queuedDirection: Direction | null;
  food: Point;
  isGameOver: boolean;
  score: number;
};

type GameAction =
  | { type: 'TURN'; direction: Direction }
  | { type: 'TICK' }
  | { type: 'RESET' };

const createInitialState = (): GameState => {
  const snake = getInitialSnake();
  return {
    snake,
    direction: 'RIGHT',
    queuedDirection: null,
    food: randomFood(snake),
    isGameOver: false,
    score: 0,
  };
};

const gameReducer = (state: GameState, action: GameAction): GameState => {
  // #region agent log
  appendDebugLog('H1', 'App.tsx:reducer:entry', 'Reducer action received', {
    action: action.type,
    isGameOver: state.isGameOver,
    direction: state.direction,
    queuedDirection: state.queuedDirection,
    head: state.snake[0] ?? null,
    length: state.snake.length,
    score: state.score,
  });
  // #endregion
  if (action.type === 'RESET') {
    const next = createInitialState();
    // #region agent log
    appendDebugLog('H2', 'App.tsx:reducer:reset', 'RESET produced initial state', {
      nextIsGameOver: next.isGameOver,
      nextDirection: next.direction,
      nextQueuedDirection: next.queuedDirection,
      nextHead: next.snake[0] ?? null,
    });
    // #endregion
    return next;
  }

  if (action.type === 'TURN') {
    if (state.isGameOver || state.queuedDirection) {
      // #region agent log
      appendDebugLog('H3', 'App.tsx:reducer:turn:blocked', 'TURN blocked by state guard', {
        requested: action.direction,
        isGameOver: state.isGameOver,
        queuedDirection: state.queuedDirection,
        direction: state.direction,
      });
      // #endregion
      return state;
    }

    const nextDirection = action.direction;
    if (
      nextDirection === state.direction ||
      OPPOSITE_DIRECTION[state.direction] === nextDirection
    ) {
      // #region agent log
      appendDebugLog('H3', 'App.tsx:reducer:turn:blocked', 'TURN blocked by direction rule', {
        requested: nextDirection,
        direction: state.direction,
      });
      // #endregion
      return state;
    }

    return {
      ...state,
      queuedDirection: nextDirection,
    };
  }

  if (state.isGameOver) {
    return state;
  }

  const moveDirection = state.queuedDirection ?? state.direction;
  const head = state.snake[0];
  const delta = DIRECTION_DELTA[moveDirection];
  const newHead: Point = {
    x: head.x + delta.x,
    y: head.y + delta.y,
  };
  // #region agent log
  appendDebugLog('H1', 'App.tsx:reducer:tick:start', 'TICK computed next head', {
    moveDirection,
    direction: state.direction,
    queuedDirection: state.queuedDirection,
    head,
    newHead,
  });
  // #endregion

  const hitWall =
    newHead.x < 0 ||
    newHead.x >= BOARD_SIZE ||
    newHead.y < 0 ||
    newHead.y >= BOARD_SIZE;
  const hitSelf = state.snake.some(
    (segment) => segment.x === newHead.x && segment.y === newHead.y,
  );

  if (hitWall || hitSelf) {
    // #region agent log
    appendDebugLog('H4', 'App.tsx:reducer:tick:collision', 'TICK set game over', {
      hitWall,
      hitSelf,
      newHead,
      head,
      moveDirection,
      snake: state.snake,
    });
    // #endregion
    return {
      ...state,
      isGameOver: true,
    };
  }

  const hasEatenFood = newHead.x === state.food.x && newHead.y === state.food.y;
  const nextSnake = [newHead, ...state.snake];

  if (!hasEatenFood) {
    nextSnake.pop();
  }

  return {
    snake: nextSnake,
    direction: moveDirection,
    queuedDirection: null,
    food: hasEatenFood ? randomFood(nextSnake) : state.food,
    isGameOver: false,
    score: hasEatenFood ? state.score + 1 : state.score,
  };
};

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);
  const { snake, food, isGameOver, score } = state;

  const snakeSet = useMemo(() => new Set(snake.map(pointKey)), [snake]);

  useEffect(() => {
    if (isGameOver) {
      return;
    }

    // #region agent log
    appendDebugLog('H5', 'App.tsx:effect:setup', 'Setting TICK interval', {
      isGameOver,
      tickMs: TICK_MS,
    });
    // #endregion
    const intervalId = setInterval(() => {
      dispatch({ type: 'TICK' });
    }, TICK_MS);

    return () => {
      // #region agent log
      appendDebugLog('H5', 'App.tsx:effect:cleanup', 'Clearing TICK interval', {
        isGameOver,
      });
      // #endregion
      clearInterval(intervalId);
    };
  }, [isGameOver]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const direction = KEY_TO_DIRECTION[event.key];
      if (!direction) {
        return;
      }
      event.preventDefault();
      // #region agent log
      appendDebugLog('H6', 'App.tsx:keyboard:keydown', 'Keyboard direction dispatched', {
        key: event.key,
        direction,
      });
      // #endregion
      dispatch({ type: 'TURN', direction });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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
          <Pressable style={styles.restartButton} onPress={() => dispatch({ type: 'RESET' })}>
            <Text style={styles.restartButtonText}>Yeniden Başlat</Text>
          </Pressable>
        </View>
      ) : (
        <Text style={styles.helpText}>
          Yön tuşları yerine aşağıdaki butonlarla oynayabilirsiniz.
        </Text>
      )}

      <View style={styles.controls}>
        <Pressable style={styles.controlButton} onPress={() => dispatch({ type: 'TURN', direction: 'UP' })}>
          <Text style={styles.controlText}>↑</Text>
        </Pressable>
        <View style={styles.horizontalControls}>
          <Pressable style={styles.controlButton} onPress={() => dispatch({ type: 'TURN', direction: 'LEFT' })}>
            <Text style={styles.controlText}>←</Text>
          </Pressable>
          <Pressable style={styles.controlButton} onPress={() => dispatch({ type: 'TURN', direction: 'DOWN' })}>
            <Text style={styles.controlText}>↓</Text>
          </Pressable>
          <Pressable style={styles.controlButton} onPress={() => dispatch({ type: 'TURN', direction: 'RIGHT' })}>
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
