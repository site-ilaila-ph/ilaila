import { AboutNav } from "./about-nav";

type AboutPageKey = "san-pedro" | "the-team" | "the-website";

/**
 * Every about page ships its own animation set — keyframes, easing and hover
 * transforms differ slightly per page, so each block is kept verbatim.
 */
const ANIMATION_STYLES: Record<AboutPageKey, string> = {
  "san-pedro": `
        @keyframes fadeUp {
          0% {
            opacity: 0;
            transform: translateY(28px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 0 0 rgba(16, 185, 129, 0.18);
          }
          50% {
            box-shadow: 0 0 30px rgba(16, 185, 129, 0.18);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -100% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        @keyframes scaleIn {
          0% {
            opacity: 0;
            transform: scale(0.92);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideInLeft {
          0% {
            opacity: 0;
            transform: translateX(-30px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          0% {
            opacity: 0;
            transform: translateX(30px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes glow {
          0%, 100% {
            text-shadow: 0 0 10px rgba(16, 185, 129, 0), 0 0 20px rgba(16, 185, 129, 0);
          }
          50% {
            text-shadow: 0 0 15px rgba(16, 185, 129, 0.5), 0 0 30px rgba(16, 185, 129, 0.3);
          }
        }

        .reveal {
          animation: fadeUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }

        .float-slow {
          animation: float 7s ease-in-out infinite;
        }

        .pulse-glow {
          animation: pulseGlow 4s ease-in-out infinite;
        }

        .shimmer-card {
          background: linear-gradient(90deg, rgba(255,255,255,0.6), rgba(255,255,255,0.15), rgba(255,255,255,0.6));
          background-size: 200% 100%;
          animation: shimmer 5s linear infinite;
        }

        .card-lift {
          transition: transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease;
        }

        .card-lift:hover {
          transform: translateY(-8px);
          box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
          border-color: rgba(16, 185, 129, 0.4);
        }

        .scale-in {
          animation: scaleIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }

        .slide-left {
          animation: slideInLeft 0.6s ease-out both;
        }

        .slide-right {
          animation: slideInRight 0.6s ease-out both;
        }

        .glow-text {
          animation: glow 3s ease-in-out infinite;
        }

        .scroll-fade {
          opacity: 0;
          transition: opacity 0.8s ease-in-out;
        }
"the-team": `
        @keyframes fadeUp {
          0% {
            opacity: 0;
            transform: translateY(28px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-12px);
          }
        }

        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 0 0 rgba(16, 185, 129, 0.1);
          }
          50% {
            box-shadow: 0 0 30px rgba(16, 185, 129, 0.18);
          }
        }

        @keyframes scaleIn {
          0% {
            opacity: 0;
            transform: scale(0.92);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideInLeft {
          0% {
            opacity: 0;
            transform: translateX(-30px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          0% {
            opacity: 0;
            transform: translateX(30px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInRotate {
          0% {
            opacity: 0;
            transform: rotate(-5deg) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: rotate(0) scale(1);
          }
        }

        .reveal {
          animation: fadeUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }

        .float-slow {
          animation: float 8s ease-in-out infinite;
        }

        .pulse-glow {
          animation: pulseGlow 4s ease-in-out infinite;
        }

        .card-lift {
          transition: transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease;
        }

        .card-lift:hover {
          transform: translateY(-8px) scale(1.01);
          box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
          border-color: rgba(16, 185, 129, 0.4);
        }

        .scale-in {
          animation: scaleIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }

        .slide-left {
          animation: slideInLeft 0.6s ease-out both;
        }

        .slide-right {
          animation: slideInRight 0.6s ease-out both;
        }

        .fade-rotate {
          animation: fadeInRotate 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
      `,
  "the-website": `
        @keyframes fadeUp {
          0% {
            opacity: 0;
            transform: translateY(28px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-12px);
          }
        }

        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 0 0 rgba(16, 185, 129, 0.08);
          }
          50% {
            box-shadow: 0 0 28px rgba(16, 185, 129, 0.15);
          }
        }

        @keyframes scaleIn {
          0% {
            opacity: 0;
            transform: scale(0.92);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideInLeft {
          0% {
            opacity: 0;
            transform: translateX(-30px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          0% {
            opacity: 0;
            transform: translateX(30px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.88) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .reveal {
          animation: fadeUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }

        .float-slow {
          animation: float 7s ease-in-out infinite;
        }

        .pulse-glow {
          animation: pulseGlow 4s ease-in-out infinite;
        }

        .card-lift {
          transition: transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease;
        }

        .card-lift:hover {
          transform: translateY(-8px) scale(1.01);
          box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
          border-color: rgba(16, 185, 129, 0.4);
        }

        .scale-in {
          animation: scaleIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }

        .slide-left {
          animation: slideInLeft 0.6s ease-out both;
        }

        .slide-right {
          animation: slideInRight 0.6s ease-out both;
        }

        .bounce-in {
          animation: bounceIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
      `,
};

        .scroll-fade.visible {
          opacity: 1;
        }
      `,
};