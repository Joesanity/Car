"use client"

import Image from "next/image";
import { Stage, Layer, Rect } from "react-konva";
import { useState, useEffect } from "react";

export default function Home() {

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [obstacleY, setObstacleY] = useState(0);
  const [obstacleX, setObstacleX] = useState(40);
  const [carX, setCarX] = useState(400);

  function randomX() {
    return Math.floor(Math.random() * dimensions.width - 50);
  }

  useEffect(() => {
    const updateSize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    return () => {
      window.removeEventListener("resize", updateSize);
    };

  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setObstacleY((prevY) => {
        const nextY = prevY + 5;
        if (nextY > dimensions.height) {
          setObstacleX(randomX());
          return 0;
        }
        return nextY;
      });
    }, 30);

    return () => {
      clearInterval(interval);
    };
  }, [dimensions.height]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setCarX((prevX) => prevX - 10);
      } else if (e.key === "ArrowRight") {
        setCarX((prevX) => prevX + 10);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);


  if (dimensions.width === 0 || dimensions.height === 0) {
    return null;
  }

  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Rect x={carX} y={window.innerHeight - 100} width={50} height={30} fill="red" />
        <Rect x={obstacleX} y={obstacleY} width={50} height={30} fill="blue" />
      </Layer>

    </Stage>
  );
}
