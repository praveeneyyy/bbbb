import { useState, useEffect, useRef } from "react";

/* ─── Canvas Particle Background ─────────────────────────────────── */
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  type: "petal" | "star" | "spark";
  rot: number;
  rotSpeed: number;
}

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const particles: Particle[] = [];
    const COLORS = ["#ff6b8a", "#ff4d7d", "#e91e63", "#ffb3c1", "#ff8fab", "#c9184a", "#fff0f3"];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const spawn = () => {
      const type: Particle["type"] = Math.random() < 0.5 ? "petal" : Math.random() < 0.6 ? "star" : "spark";
      particles.push({
        x: Math.random() * canvas.width,
        y: -20,
        vx: (Math.random() - 0.5) * 0.8,
        vy: 0.4 + Math.random() * 0.9,
        size: type === "petal" ? 5 + Math.random() * 9 : type === "star" ? 2 + Math.random() * 4 : 1.5 + Math.random() * 3,
        alpha: 0.15 + Math.random() * 0.55,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        type,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.04,
      });
    };

    const drawPetal = (ctx: CanvasRenderingContext2D, p: Particle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 0.55, p.size, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawStar = (ctx: CanvasRenderingContext2D, p: Particle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 6;
      ctx.shadowColor = p.color;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2 + p.rot;
        const r = i % 2 === 0 ? p.size : p.size * 0.4;
        ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const drawSpark = (ctx: CanvasRenderingContext2D, p: Particle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = "#fff0f3";
      ctx.shadowBlur = 8;
      ctx.shadowColor = "#ff6b8a";
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    let raf: number;
    let spawnTimer = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      spawnTimer++;
      if (spawnTimer % 6 === 0) spawn();

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx + Math.sin(p.y * 0.018) * 0.4;
        p.y += p.vy;
        p.rot += p.rotSpeed;
        p.alpha -= 0.0005;

        if (p.y > canvas.height + 30 || p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        if (p.type === "petal") drawPetal(ctx, p);
        else if (p.type === "star") drawStar(ctx, p);
        else drawSpark(ctx, p);
      }
      raf = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
    />
  );
}

/* ─── Glowing Orbs ────────────────────────────────────────────────── */
function GlowOrbs() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      <div style={{
        position: "absolute", width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(233,30,99,0.18) 0%, transparent 70%)",
        top: "-100px", left: "-100px", animation: "orbFloat1 12s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,107,138,0.14) 0%, transparent 70%)",
        bottom: "-80px", right: "-80px", animation: "orbFloat2 15s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", width: 300, height: 300, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(194,24,91,0.12) 0%, transparent 70%)",
        top: "40%", right: "10%", animation: "orbFloat3 18s ease-in-out infinite",
      }} />
    </div>
  );
}

/* ─── Floating Hearts from Bottom ────────────────────────────────── */
const HEART_CONFIGS = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${4 + (i * 5.4) % 92}%`,
  size: 10 + (i * 7) % 18,
  duration: 6 + (i * 1.3) % 7,
  delay: (i * 0.55) % 8,
  opacity: 0.35 + (i * 0.04) % 0.45,
  drift: ((i % 3) - 1) * 22,
  color: ["#ff6b8a","#ff4d7d","#e91e63","#ffb3c1","#ff8fab","#c9184a"][i % 6],
}));

function FloatingHeartsBottom() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1, overflow: "hidden" }}>
      {HEART_CONFIGS.map((h) => (
        <div
          key={h.id}
          style={{
            position: "absolute",
            bottom: "-40px",
            left: h.left,
            width: h.size,
            height: h.size,
            animation: `riseHeart ${h.duration}s ${h.delay}s ease-in infinite`,
            opacity: 0,
          }}
        >
          <svg viewBox="0 0 32 29" fill={h.color} style={{ width: "100%", height: "100%", filter: `drop-shadow(0 0 ${h.size * 0.4}px ${h.color}88)` }}>
            <path d="M16 27.5S1 17.5 1 8.5a7.5 7.5 0 0 1 15-1 7.5 7.5 0 0 1 15 1c0 9-15 19-15 19z"/>
          </svg>
        </div>
      ))}
    </div>
  );
}

/* ─── No Button ───────────────────────────────────────────────────── */
const DIRECTIONS = [
  { x: 160, y: 0 },
  { x: 160, y: 80 },
  { x: 0, y: 80 },
  { x: -80, y: 80 },
  { x: -80, y: 0 },
  { x: -80, y: -80 },
  { x: 0, y: -80 },
  { x: 80, y: -80 },
];

function NoButton() {
  const [dirIdx, setDirIdx] = useState(0);
  const pos = DIRECTIONS[dirIdx];

  return (
    <button
      onMouseEnter={() => setDirIdx((i) => (i + 1) % DIRECTIONS.length)}
      onFocus={() => setDirIdx((i) => (i + 1) % DIRECTIONS.length)}
      style={{
        position: "relative",
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        transition: "transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)",
        background: "rgba(255,255,255,0.06)",
        color: "rgba(255,190,205,0.55)",
        border: "1px solid rgba(255,107,138,0.25)",
        borderRadius: "50px",
        padding: "14px 36px",
        fontSize: "1rem",
        fontFamily: "'Cormorant Garamond', serif",
        fontWeight: 400,
        letterSpacing: "0.08em",
        cursor: "not-allowed",
        backdropFilter: "blur(8px)",
        userSelect: "none",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      No 🙈
    </button>
  );
}

/* ─── Main Page ───────────────────────────────────────────────────── */
export default function Valentine() {
  const [answered, setAnswered] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const handleInteraction = () => {
      if (audioRef.current) {
        audioRef.current.play().then(() => {
          setShowHint(false);
          document.removeEventListener("click", handleInteraction);
        }).catch(() => {});
      }
    };

    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setShowHint(false);
      }).catch((err) => {
        // Fallback: Show the hint and wait for interaction if autoplay fails
        setShowHint(true);
        document.addEventListener("click", handleInteraction);
        console.warn("Autoplay was blocked by the browser. Waiting for interaction.", err);
      });
    }

    return () => document.removeEventListener("click", handleInteraction);
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = isMuted;
  }, [isMuted]);

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflowX: "hidden",
        background: "linear-gradient(160deg, #0d0008 0%, #1f0010 20%, #3b0020 45%, #1f0010 75%, #0d0008 100%)",
        fontFamily: "'Cormorant Garamond', serif",
        padding: "2rem 1rem 4rem",
      }}
    >
      <ParticleCanvas />
      <GlowOrbs />
      <FloatingHeartsBottom />

      <audio ref={audioRef} loop autoPlay src="/bg-song.mp3" />

      {showHint && (
        <div style={{
          position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)",
          zIndex: 50, color: "rgba(255,179,193,0.55)", fontSize: "0.82rem",
          fontFamily: "'Cormorant Garamond', serif", letterSpacing: "0.12em",
          animation: "pulseFade 2.5s ease-in-out infinite",
        }}>
          ♫ click anywhere to play music ♫
        </div>
      )}

      <button
        onClick={() => setIsMuted((m) => !m)}
        title={isMuted ? "Unmute" : "Mute"}
        style={{
          position: "fixed", top: 14, right: 16, zIndex: 50,
          width: 42, height: 42, borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.1rem",
          background: "rgba(255,255,255,0.07)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,107,138,0.25)",
          color: "white", cursor: "pointer",
          transition: "all 0.2s",
          boxShadow: "0 0 15px rgba(233,30,99,0.2)",
        }}
      >
        {isMuted ? "🔇" : "🔊"}
      </button>

      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 680, display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* ── Title ── */}
        <div style={{
          fontFamily: "'Great Vibes', cursive",
          fontSize: "clamp(2.8rem, 8vw, 5rem)",
          color: "#ff6b8a",
          textShadow: "0 0 40px rgba(255,107,138,0.9), 0 0 80px rgba(255,107,138,0.4), 0 0 120px rgba(233,30,99,0.2)",
          textAlign: "center",
          lineHeight: 1.15,
          marginBottom: "0.4rem",
        }}>
          Happy Birthday, My Love
        </div>

        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 300,
          fontStyle: "italic",
          fontSize: "clamp(0.85rem, 2.2vw, 1rem)",
          color: "rgba(255,200,215,0.6)",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          marginBottom: "2.2rem",
          textAlign: "center",
        }}>
          ✦ &nbsp; to the one who owns my heart &nbsp; ✦
        </div>

        {/* ── Photo Frame ── */}
        <div style={{ position: "relative", marginBottom: "2.4rem" }}>
          <div style={{
            width: "clamp(200px, 38vw, 270px)",
            height: "clamp(200px, 38vw, 270px)",
            position: "relative",
          }}>
            <div style={{
              position: "absolute", inset: -10, borderRadius: "50%",
              background: "conic-gradient(from 0deg, #ff6b8a, #e91e63, #c2185b, #ff4d7d, #ff6b8a)",
              animation: "spinRing 5s linear infinite",
              opacity: 0.75,
              filter: "blur(1px)",
            }} />
            <div style={{
              position: "absolute", inset: -4, borderRadius: "50%",
              background: "#0d0008",
            }} />
            <div style={{
              position: "absolute", inset: -18, borderRadius: "50%",
              background: "conic-gradient(from 180deg, #ff6b8a40, #e91e6320, #ff6b8a40)",
              animation: "spinRing 8s linear infinite reverse",
              opacity: 0.5,
            }} />
            <div style={{
              position: "relative",
              width: "100%", height: "100%",
              borderRadius: "50%",
              overflow: "hidden",
              border: "3px solid rgba(255,107,138,0.35)",
              boxShadow: "0 0 40px rgba(255,107,138,0.5), inset 0 0 30px rgba(0,0,0,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "radial-gradient(circle, rgba(255,107,138,0.08) 0%, rgba(13,0,8,0.9) 100%)",
            }}>
              <img
                src="/placeholder-photo.jpg"
                alt="Her beautiful photo"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const f = e.currentTarget.nextElementSibling as HTMLElement;
                  if (f) f.style.display = "flex";
                }}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div style={{
                display: "none",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "100%", height: "100%",
                color: "rgba(255,150,170,0.7)",
                textAlign: "center",
                padding: "1rem",
                gap: "0.4rem",
              }}>
                <div style={{ fontSize: "3.5rem" }}>📸</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.78rem", lineHeight: 1.5, fontStyle: "italic" }}>
                  Add your photo as<br />
                  <code style={{ fontSize: "0.68rem", color: "#ff6b8a", fontStyle: "normal" }}>public/placeholder-photo.jpg</code>
                </div>
              </div>
            </div>
          </div>

          <div style={{
            position: "absolute", bottom: -14, left: "50%", transform: "translateX(-50%)",
            fontSize: "1.4rem",
            animation: "floatHeart 2.4s ease-in-out infinite",
          }}>🌹</div>
        </div>

        {/* ── Message Card ── */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,107,138,0.15)",
          borderRadius: "20px",
          padding: "clamp(1.4rem, 4vw, 2.2rem)",
          marginBottom: "2.4rem",
          boxShadow: "0 0 60px rgba(233,30,99,0.08), inset 0 0 30px rgba(255,107,138,0.03)",
          maxWidth: 580,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "1.1rem",
        }}>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            fontSize: "clamp(1rem, 2.4vw, 1.12rem)",
            color: "rgba(255,225,230,0.9)",
            lineHeight: 2,
            textAlign: "center",
            margin: 0,
          }}>
            I don't know where to start… but I've been holding this in for a long time. 🥺
            I've been loving you since our 1st year of college. Not a day passed without
            you crossing my mind. I tried to ignore it, I tried to convince myself to stay
            away… because somewhere deep inside, I always felt — will someone like you
            ever fall for someone like me? 💭
          </p>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            fontSize: "clamp(1rem, 2.4vw, 1.12rem)",
            color: "rgba(255,200,215,0.88)",
            lineHeight: 2,
            textAlign: "center",
            margin: 0,
          }}>
            But no matter how much I tried to step back, my heart never listened. ❤️
          </p>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            fontSize: "clamp(1rem, 2.4vw, 1.12rem)",
            color: "rgba(255,225,230,0.9)",
            lineHeight: 2,
            textAlign: "center",
            margin: 0,
          }}>
            Your eyes… they were the first reason I fell for you. There's something in them
            I can't explain — it just pulls me in. 👁️ And then your thoughts, your attitude…
            that strength, that uniqueness — you don't even realize how special that makes
            you. I fell in love with that version of you… completely, silently, deeply. ✨
          </p>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            fontSize: "clamp(1rem, 2.4vw, 1.12rem)",
            color: "rgba(255,200,215,0.88)",
            lineHeight: 2,
            textAlign: "center",
            margin: 0,
          }}>
            I never said anything all this time, not because I didn't feel enough…
            but because I felt <em>too much</em>. 🌊
          </p>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            fontSize: "clamp(1rem, 2.4vw, 1.12rem)",
            color: "rgba(255,225,230,0.9)",
            lineHeight: 2,
            textAlign: "center",
            margin: 0,
          }}>
            I don't know if there's even a small place for me in your heart… but if there
            is, I promise I'll cherish it forever. 🌸 Being with you, even in the smallest
            moments, feels like the biggest happiness. And honestly… traveling with you,
            living those simple moments together — that has become one of my biggest dreams. ☁️
          </p>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            fontSize: "clamp(1rem, 2.4vw, 1.12rem)",
            color: "rgba(255,200,215,0.88)",
            lineHeight: 2,
            textAlign: "center",
            margin: 0,
          }}>
            Maybe the world is huge, maybe life will take us in different directions…
            but my feelings for you have never changed. 🏹
          </p>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            fontSize: "clamp(1rem, 2.4vw, 1.12rem)",
            color: "rgba(255,225,230,0.9)",
            lineHeight: 2,
            textAlign: "center",
            margin: 0,
          }}>
            Please understand mine… 🙏
          </p>
          <p style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "clamp(0.92rem, 2.2vw, 1.05rem)",
            color: "rgba(255,170,190,0.8)",
            lineHeight: 1.85,
            textAlign: "center",
            margin: 0,
          }}>
            Raathalo radha ledhu ani thelisina kuda Krishnudu preminchadam aapaledhu gaa…
            Na prema kuda alage.
          </p>
          <p style={{
            fontFamily: "'Great Vibes', cursive",
            fontSize: "clamp(1.3rem, 3.5vw, 1.7rem)",
            color: "#ff6b8a",
            textShadow: "0 0 20px rgba(255,107,138,0.6)",
            textAlign: "center",
            margin: 0,
            lineHeight: 1.4,
          }}>
            In a world full of choices, my heart chose only you. 💘
          </p>
        </div>

        {/* ── Valentine Section ── */}
        {!answered ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.6rem", width: "100%" }}>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: "italic",
              fontSize: "clamp(1.3rem, 4vw, 1.85rem)",
              color: "#ffb3c1",
              textAlign: "center",
              textShadow: "0 0 25px rgba(255,107,138,0.7)",
              letterSpacing: "0.02em",
            }}>
              💌 &nbsp; Will you be my Valentine? &nbsp; 💌
            </div>

            <div style={{
              display: "flex",
              gap: "2rem",
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "nowrap",
              minHeight: 120,
              width: "100%",
              position: "relative",
            }}>
              <button
                onClick={() => setAnswered(true)}
                style={{
                  background: "linear-gradient(135deg, #e91e63 0%, #c2185b 50%, #ad1457 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "50px",
                  padding: "15px 44px",
                  fontSize: "1.05rem",
                  fontFamily: "'Playfair Display', serif",
                  fontStyle: "italic",
                  fontWeight: 500,
                  letterSpacing: "0.06em",
                  cursor: "pointer",
                  boxShadow: "0 0 35px rgba(233,30,99,0.7), 0 6px 20px rgba(0,0,0,0.35)",
                  transition: "all 0.25s",
                  flexShrink: 0,
                }}
                onMouseEnter={e => {
                  const b = e.currentTarget;
                  b.style.transform = "scale(1.09)";
                  b.style.boxShadow = "0 0 55px rgba(233,30,99,0.9), 0 8px 25px rgba(0,0,0,0.4)";
                }}
                onMouseLeave={e => {
                  const b = e.currentTarget;
                  b.style.transform = "scale(1)";
                  b.style.boxShadow = "0 0 35px rgba(233,30,99,0.7), 0 6px 20px rgba(0,0,0,0.35)";
                }}
              >
                Yes, always ❤️
              </button>

              <NoButton />
            </div>

            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              color: "rgba(255,150,170,0.4)",
              fontSize: "0.82rem",
              letterSpacing: "0.06em",
              textAlign: "center",
            }}>
              the No button seems to be a little shy…
            </div>
          </div>
        ) : (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: "1.4rem",
            animation: "fadeSlideUp 0.9s cubic-bezier(0.16,1,0.3,1) forwards",
          }}>
            <div style={{ fontSize: "3rem", lineHeight: 1, animation: "popIn 0.6s cubic-bezier(0.34,1.56,0.64,1)" }}>
              🌹&nbsp;💍&nbsp;🌹
            </div>
            <div style={{
              fontFamily: "'Great Vibes', cursive",
              fontSize: "clamp(2rem, 6vw, 3.2rem)",
              color: "#ff6b8a",
              textShadow: "0 0 40px rgba(255,107,138,0.9)",
              textAlign: "center",
              lineHeight: 1.2,
            }}>
              You just made me the luckiest person alive
            </div>
            <div style={{
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255,107,138,0.15)",
              borderRadius: "16px",
              padding: "1.8rem 2rem",
              maxWidth: 500,
              textAlign: "center",
            }}>
              <p style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 300,
                fontSize: "clamp(1rem, 2.4vw, 1.12rem)",
                color: "rgba(255,220,228,0.9)",
                lineHeight: 1.95,
                marginBottom: "1rem",
              }}>
                From this moment, forever, and in every lifetime — I choose
                you. Not because love demands it, but because my heart has
                never wanted anything more certain than you. 💍
              </p>
              <p style={{
                fontFamily: "'Playfair Display', serif",
                fontStyle: "italic",
                fontSize: "clamp(0.92rem, 2vw, 1rem)",
                color: "rgba(255,160,180,0.8)",
              }}>
                Happy Birthday, my forever Valentine. You are my greatest gift. 🎁
              </p>
            </div>
            <div style={{
              display: "flex", gap: "0.6rem", fontSize: "1.8rem",
              animation: "floatHeart 2s ease-in-out infinite",
            }}>
              ❤️ &nbsp; ✨ &nbsp; ❤️
            </div>
          </div>
        )}

        <div style={{
          marginTop: "3rem",
          fontFamily: "'Cormorant Garamond', serif",
          color: "rgba(255,150,170,0.25)",
          fontSize: "1rem",
          letterSpacing: "0.4em",
          textAlign: "center",
        }}>
          ✦ &nbsp; ✦ &nbsp; ✦
        </div>
      </div>

      <style>{`
        @keyframes riseHeart {
          0%   { transform: translateY(0) translateX(0px);    opacity: 0; }
          10%  { opacity: var(--h-op, 0.7); }
          30%  { transform: translateY(-30vh) translateX(12px); }
          50%  { transform: translateY(-55vh) translateX(-10px); }
          70%  { transform: translateY(-75vh) translateX(14px); }
          90%  { opacity: var(--h-op, 0.5); }
          100% { transform: translateY(-105vh) translateX(-6px); opacity: 0; }
        }
        @keyframes spinRing {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes floatHeart {
          0%, 100% { transform: translateY(0) translateX(-50%); }
          50%       { transform: translateY(-8px) translateX(-50%); }
        }
        @keyframes pulseFade {
          0%, 100% { opacity: 0.55; }
          50%       { opacity: 0.9; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          from { transform: scale(0.4); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
        @keyframes orbFloat1 {
          0%, 100% { transform: translate(0, 0); }
          33%       { transform: translate(60px, 40px); }
          66%       { transform: translate(-30px, 70px); }
        }
        @keyframes orbFloat2 {
          0%, 100% { transform: translate(0, 0); }
          40%       { transform: translate(-50px, -60px); }
          70%       { transform: translate(30px, -30px); }
        }
        @keyframes orbFloat3 {
          0%, 100% { transform: translate(0, 0); }
          50%       { transform: translate(-40px, 50px); }
        }
        body { margin: 0; padding: 0; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
