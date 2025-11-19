"use client";

import createGlobe from "cobe";
import { useEffect, useRef, useState } from "react";

export function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const globeRef = useRef<any>(null);
  const phiRef = useRef(0);

  const [bursts, setBursts] = useState<
    {
      id: string;
      lat: number;
      lng: number;
      startTime: number;
      duration: number;
    }[]
  >([]);
  const [markers, setMarkers] = useState<any[]>([]);

  const lastMarkersRef = useRef<any[]>([]);

  useEffect(() => {
    // Random burst generation
    const generateBurst = () => {
      const newBurst = {
        id: Math.random().toString(36).substr(2, 9),
        lat: (Math.random() - 0.5) * 180,
        lng: (Math.random() - 0.5) * 360,
        startTime: Date.now(),
        duration: 4000,
      };
      setBursts((prev) => [...prev, newBurst]);

      // Schedule next burst randomly (3-5 seconds)
      const nextDelay = Math.random() * 2000 + 3000;
      setTimeout(generateBurst, nextDelay);
    };

    generateBurst();

    return () => {
      // Cleanup timeout if needed, but since chained, not necessary
    };
  }, []);

  useEffect(() => {
    // Animation loop to compute markers
    let animationId: number;

    const animate = () => {
      const now = Date.now();
      const activeBursts = bursts.filter(
        (burst) => now - burst.startTime < burst.duration
      );

      if (activeBursts.length !== bursts.length) {
        setBursts(activeBursts);
      }

      const computedMarkers = activeBursts
        .map((burst) => {
          const age = now - burst.startTime;
          const progress = age / burst.duration;
          if (progress >= 1) {
            return null;
          }

          const size = Math.sin(progress * Math.PI) * 0.1; // Larger for visibility
          const color = [1, 1, 1]; // Always white

          return {
            location: [burst.lat, burst.lng],
            size,
            color,
          };
        })
        .filter(Boolean);

      // Only update if changed to avoid unnecessary recreations
      if (
        JSON.stringify(computedMarkers) !==
        JSON.stringify(lastMarkersRef.current)
      ) {
        setMarkers(computedMarkers);
        lastMarkersRef.current = computedMarkers;
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [bursts]);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    // Set canvas dimensions
    const dpr = 2;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    phiRef.current = phiRef.current || 0; // Ensure initialized

    globeRef.current = createGlobe(canvas, {
      devicePixelRatio: dpr,
      width: canvas.width,
      height: canvas.height,
      phi: phiRef.current,
      theta: 0.2,
      dark: 1,
      diffuse: 1.95,
      scale: 0.9,
      mapSamples: 16_000,
      mapBrightness: 3.3,
      mapBaseBrightness: 0.12,
      baseColor: [1, 1, 1],
      markerColor: [1, 1, 1],
      glowColor: [1, 1, 1],
      offset: [0, 0],
      markers,
      opacity: 0.8,
      onRender: (state: any) => {
        state.phi = phiRef.current + Math.sin(Date.now() * 0.0001) * 0.001;
        phiRef.current += 0.0005;
      },
    });

    const handleResize = () => {
      if (globeRef.current) {
        globeRef.current.destroy();
        globeRef.current = null;
      }

      // Re-init globe on resize
      setTimeout(() => {
        if (canvasRef.current) {
          const canvas2 = canvasRef.current;
          const dpr2 = 2;
          const rect2 = canvas2.getBoundingClientRect();
          canvas2.width = rect2.width * dpr2;
          canvas2.height = rect2.height * dpr2;

          globeRef.current = createGlobe(canvas2, {
            devicePixelRatio: dpr2,
            width: canvas2.width,
            height: canvas2.height,
            phi: phiRef.current,
            theta: 0.2,
            dark: 1,
            diffuse: 1.95,
            scale: 0.9,
            mapSamples: 16_000,
            mapBrightness: 3.3,
            mapBaseBrightness: 0.12,
            baseColor: [1, 1, 1],
            markerColor: [1, 1, 1],
            glowColor: [1, 1, 1],
            offset: [0, 0],
            opacity: 0.8,
            markers,
            onRender: (state: any) => {
              state.phi =
                phiRef.current + Math.sin(Date.now() * 0.0001) * 0.001;
              phiRef.current += 0.0005;
            },
          });
        }
      }, 100);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (globeRef.current) {
        globeRef.current.destroy();
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [markers]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 1,
        opacity: 0.1,
        pointerEvents: "none",
      }}
    />
  );
}
