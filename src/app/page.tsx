"use client";

import { useState, useEffect, useRef } from "react";
import { Stage, Layer, Image as KonvaImage, Text } from "react-konva";
import useImage from "use-image";

export default function Home() {
  // === CONSTANTS ===
  const CAR_WIDTH = 100;
  const CAR_HEIGHT = 180;
  const ROAD_WIDTH = 400;
  const OBSTACLE_WIDTH = 90;
  const OBSTACLE_HEIGHT = 60;
  const MOVE_STEP = 15;
  const OBSTACLE_SPEED = 10;

  // === IMAGES ===
  const [roadImage] = useImage("/Road.jpg");
  const [carImage] = useImage("/car.png");
  const [obstacleImage] = useImage("/obstacle.png");

  // === STATE ===
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [obstacleY, setObstacleY] = useState(0);
  const [obstacleX, setObstacleX] = useState(0);
  const [carX, setCarX] = useState(0);
  const [score, setScore] = useState(0);
  const [roadScroll, setRoadScroll] = useState(0);

  // === REFS ===
  const keysPressed = useRef<{ [key: string]: boolean }>({
    ArrowLeft: false,
    ArrowRight: false,
  });
  const crashed = useRef(false);

  const roadX = (dimensions.width - ROAD_WIDTH) / 2;

  function getRandomObstacleX() {
    return Math.floor(Math.random() * (ROAD_WIDTH - OBSTACLE_WIDTH));
  }

  // === HANDLE ROAD SCROLL ===

  useEffect(() => {
    const interval = setInterval(() => {
      setRoadScroll((prevY) => (prevY + 10) % dimensions.height);
    }, 30);

    return () => clearInterval(interval);
  }, [dimensions.height]);




  // === Handle screen resizing ===

  useEffect(() => {
    const updateSize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // === Setup initial positions ===
  useEffect(() => {
    if (dimensions.width === 0) return;
    setCarX((ROAD_WIDTH - CAR_WIDTH) / 2);
    setObstacleX(getRandomObstacleX());
  }, [dimensions.width]);

  // === Obstacle movement ===
  useEffect(() => {
    const interval = setInterval(() => {
      setObstacleY((prevY) => {
        const nextY = prevY + OBSTACLE_SPEED;
        if (nextY > dimensions.height) {
          setObstacleX(getRandomObstacleX());
          return 0;
        }
        return nextY;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [dimensions.height]);

  // === Key events ===
  const handleKeyDown = (e: KeyboardEvent) => {
    keysPressed.current[e.key] = true;
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    keysPressed.current[e.key] = false;
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // === Car movement (held keys) ===
  useEffect(() => {
    const interval = setInterval(() => {
      if (keysPressed.current.ArrowLeft) {
        setCarX((prev) => Math.max(prev - MOVE_STEP, 0));
      }
      if (keysPressed.current.ArrowRight) {
        setCarX((prev) => Math.min(prev + MOVE_STEP, ROAD_WIDTH - CAR_WIDTH));
      }
    }, 16);
    return () => clearInterval(interval);
  }, []);

  // === Collision detection ===
  useEffect(() => {
    const carY = dimensions.height - CAR_HEIGHT;
    const isColliding =
      obstacleY < carY + CAR_HEIGHT &&
      obstacleY + OBSTACLE_HEIGHT > carY &&
      obstacleX < carX + CAR_WIDTH &&
      obstacleX + OBSTACLE_WIDTH > carX;

    if (isColliding) {
      alert("Crashed!");
      crashed.current = true;
      setObstacleY(0);
      setObstacleX(getRandomObstacleX());
      setScore(0);
      keysPressed.current.ArrowLeft = false;
      keysPressed.current.ArrowRight = false;
    }
  }, [obstacleY, carX, obstacleX, dimensions.height]);

  // === Scoring logic (only score when no crash) ===
  useEffect(() => {
    if (obstacleY === 0 && !crashed.current) {
      setScore((prev) => prev + 1);
    }

    if (obstacleY === 0) {
      crashed.current = false;
    }
  }, [obstacleY]);

  // === Render check ===
  if (dimensions.width === 0 || dimensions.height === 0) return null;

  return (
    <Stage width={dimensions.width} height={dimensions.height}>
      <Layer>
        {/* ROAD */}
        <KonvaImage
          x={roadX}
          y={roadScroll}
          width={ROAD_WIDTH}
          height={dimensions.height}
          image={roadImage}
        />
        <KonvaImage
          x={roadX}
          y={roadScroll - dimensions.height}
          width={ROAD_WIDTH}
          height={dimensions.height}
          image={roadImage}
        />

        {/* CAR */}
        <KonvaImage
          x={carX + roadX}
          y={dimensions.height - CAR_HEIGHT}
          width={CAR_WIDTH}
          height={CAR_HEIGHT}
          image={carImage}
        />

        {/* OBSTACLE */}
        <KonvaImage
          x={obstacleX + roadX}
          y={obstacleY}
          width={OBSTACLE_WIDTH}
          height={OBSTACLE_HEIGHT}
          image={obstacleImage}
        />

        {/* SCORE */}
        <Text
          text={`Score: ${score}`}
          x={20}
          y={20}
          fontSize={24}
          fill="white"
        />
      </Layer>
    </Stage>
  );
}
