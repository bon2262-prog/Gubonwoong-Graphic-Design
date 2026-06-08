import React, { useEffect, useRef } from 'react';

interface InteractiveCanvasProps {
  type: string; // 'dynamic_active_canvas' | 'chrome_pulse_wave' | 'perlin_noise_field' | 'glass_refraction_loop' | 'typography_warp'
  theme?: 'dark' | 'light';
}

export const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({ type, theme = 'dark' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('resize', handleResize);

    // Initial mouse coordinate center
    mouseRef.current.x = width / 2;
    mouseRef.current.y = height / 2;
    mouseRef.current.targetX = width / 2;
    mouseRef.current.targetY = height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.targetX = e.clientX - rect.left;
      mouseRef.current.targetY = e.clientY - rect.top;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // Math variables for procedural render loops
    let time = 0;
    const points: { x: number; y: number; baseSize: number; angle: number; speed: number }[] = [];

    // Initialize points for particle flow fields
    const particleCount = type === 'perlin_noise_field' ? 120 : 60;
    for (let i = 0; i < particleCount; i++) {
      points.push({
        x: Math.random() * width,
        y: Math.random() * height,
        baseSize: Math.random() * 2.5 + 0.5,
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.8 + 0.2
      });
    }

    const render = () => {
      time += 0.006;

      // Mouse smoothing lerp
      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      // Render preset branches
      if (type === 'dynamic_active_canvas' || type === 'chrome_pulse_wave') {
        // --- Liquid Chromium fluid wave ribbons ---
        ctx.fillStyle = theme === 'dark' ? 'rgba(17,17,17,0.12)' : 'rgba(243,240,234,0.12)';
        ctx.fillRect(0, 0, width, height);

        const lines = 18;
        ctx.lineWidth = 1.5;

        for (let j = 0; j < lines; j++) {
          ctx.beginPath();
          const opacity = (1 - j / lines) * 0.6;
          
          // Color palettes based on theme
          if (theme === 'dark') {
            // Chrome iridescent glow with bronze accent
            if (j % 3 === 0) {
              ctx.strokeStyle = `rgba(197, 168, 128, ${opacity})`; // Bronze
            } else if (j % 3 === 1) {
              ctx.strokeStyle = `rgba(142, 138, 131, ${opacity * 0.8})`; // Muted steel
            } else {
              ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.5})`; // Refraction highlight
            }
          } else {
            // High contrast elegant lines
            if (j % 3 === 0) {
              ctx.strokeStyle = `rgba(29, 29, 29, ${opacity * 0.7})`; // Deep black ink
            } else if (j % 3 === 1) {
              ctx.strokeStyle = `rgba(197, 168, 128, ${opacity})`; // Bronze paper accent
            } else {
              ctx.strokeStyle = `rgba(142, 138, 131, ${opacity * 0.5})`; // Muted pencil
            }
          }

          const amplitude = 40 + j * 6;
          const frequency = 0.003 + j * 0.0002;

          for (let x = 0; x <= width; x += 30) {
            // Fluid formula deformed by mouse pull
            const distanceToMouse = Math.hypot(x - mouse.x, (height / 2) - mouse.y);
            const mouseEffect = mouse.active ? Math.max(0, 1 - distanceToMouse / (width * 0.45)) : 0;
            const mouseLift = mouseEffect * (mouse.y - height / 2) * 0.85;

            const y =
              height / 2 +
              Math.sin(x * frequency + time + j * 0.15) * amplitude * (1 - mouseEffect * 0.35) +
              mouseLift +
              Math.cos(time * 0.5 + x * 0.001) * 20;

            if (x === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.stroke();
        }
      } else if (type === 'perlin_noise_field') {
        // --- Vector Curl Field (Octane development studies) ---
        ctx.fillStyle = theme === 'dark' ? 'rgba(17,17,17,0.15)' : 'rgba(243,240,234,0.15)';
        ctx.fillRect(0, 0, width, height);

        points.forEach((p, idx) => {
          // Flow physics field lines
          const angle = Math.sin(p.x * 0.003 + time) * Math.PI * 2 + Math.cos(p.y * 0.003 - time) * Math.PI;
          
          // Pull vector toward mouse
          let dx = 0;
          let dy = 0;
          if (mouse.active) {
            const dist = Math.hypot(p.x - mouse.x, p.y - mouse.y);
            if (dist < 200) {
              dx = (mouse.x - p.x) * 0.02;
              dy = (mouse.y - p.y) * 0.02;
            }
          }

          p.x += Math.cos(angle) * p.speed + dx;
          p.y += Math.sin(angle) * p.speed + dy;

          // Boundary wrapping
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          // Drawing glowing fiber points
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.baseSize, 0, Math.PI * 2);
          
          const strokeCol = theme === 'dark' 
            ? (idx % 4 === 0 ? 'rgba(197, 168, 128, 0.75)' : 'rgba(255, 255, 255, 0.55)')
            : (idx % 4 === 0 ? 'rgba(197, 168, 128, 0.9)' : 'rgba(29, 29, 29, 0.75)');
            
          ctx.fillStyle = strokeCol;
          ctx.fill();

          // Connect nearby points to form structural mesh webbing
          if (idx < points.length - 1) {
            const nextIdx = idx + 1;
            const dist = Math.hypot(p.x - points[nextIdx].x, p.y - points[nextIdx].y);
            if (dist < 60) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(points[nextIdx].x, points[nextIdx].y);
              ctx.strokeStyle = theme === 'dark' 
                ? `rgba(142, 138, 131, ${0.15 * (1 - dist / 60)})`
                : `rgba(29, 29, 29, ${0.12 * (1 - dist / 60)})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        });
      } else {
        // --- Fallback elegant geometric web grid ---
        ctx.fillStyle = theme === 'dark' ? '#111111' : '#F3F0EA';
        ctx.fillRect(0, 0, width, height);

        const gridSize = 45;
        const radius = 1.3;
        ctx.fillStyle = theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(29, 29, 29, 0.12)';
        ctx.strokeStyle = theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(29, 29, 29, 0.03)';
        ctx.lineWidth = 0.5;

        // Draw structural modular grids
        for (let x = 0; x < width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Draw points deformed by mouse magnet
        for (let x = gridSize; x < width - gridSize; x += gridSize) {
          for (let y = gridSize; y < height - gridSize; y += gridSize) {
            const distX = mouse.x - x;
            const distY = mouse.y - y;
            const dist = Math.hypot(distX, distY);
            let drawX = x;
            let drawY = y;

            if (mouse.active && dist < 150) {
              const force = (150 - dist) / 150;
              drawX += distX * force * 0.18;
              drawY += distY * force * 0.18;
            }

            ctx.beginPath();
            ctx.arc(drawX, drawY, radius, 0, Math.PI * 2);
            ctx.fillStyle = theme === 'dark' ? 'rgba(197, 168, 128, 0.5)' : 'rgba(29, 29, 29, 0.4)';
            ctx.fill();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [type, theme]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden select-none">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};
