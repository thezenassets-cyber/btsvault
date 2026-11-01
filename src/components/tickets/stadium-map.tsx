"use client";

import type { RollId } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { getSection } from "@/data/seating";

/** 2D end-stage chart. Stage is its own object. Floor sits in front. Bowl wraps three sides. */
const BLOCKS: Record<string, { x: number; y: number; w: number; h: number }> = {
  B4L: { x: 20, y: 128, w: 72, h: 412 },
  B2: { x: 104, y: 36, w: 170, h: 68 },
  B1: { x: 286, y: 20, w: 388, h: 84 },
  B3: { x: 686, y: 36, w: 170, h: 68 },
  B4R: { x: 868, y: 128, w: 72, h: 412 },

  M4L: { x: 108, y: 190, w: 78, h: 350 },
  M2: { x: 196, y: 118, w: 150, h: 72 },
  M1: { x: 358, y: 116, w: 244, h: 78 },
  M3: { x: 614, y: 118, w: 150, h: 72 },
  M4R: { x: 774, y: 190, w: 78, h: 350 },

  F4L: { x: 200, y: 436, w: 84, h: 102 },
  F2: { x: 292, y: 422, w: 108, h: 116 },
  F1: { x: 408, y: 408, w: 152, h: 130 },
  F3: { x: 568, y: 422, w: 108, h: 116 },
  F4R: { x: 684, y: 436, w: 84, h: 102 },
};

const FILL: Record<RollId, string> = {
  front: "#d4af37",
  middle: "#7b2cbf",
  back: "#4c5d7a",
};

export function StadiumMap({
  activeSectionId,
  selectedSectionIds,
  highlightSectionId,
  interactive = true,
  onSelect,
}: {
  activeSectionId?: string | null;
  selectedSectionIds?: string[];
  highlightSectionId?: string | null;
  interactive?: boolean;
  onSelect?: (sectionId: string) => void;
}) {
  const marked = new Set(selectedSectionIds ?? []);

  return (
    <svg viewBox="0 0 960 720" className="w-full" role="img" aria-label="Concert floor plan">
      <rect width="960" height="720" rx="28" fill="#0c0a10" />
      <text x="480" y="16" textAnchor="middle" fill="#8ea0be" fontSize="11" letterSpacing="3">
        UPPER BOWL
      </text>

      {Object.entries(BLOCKS).map(([id, box]) => {
        const section = getSection(id);
        if (!section) return null;
        const highlighted = highlightSectionId === id;
        const active = activeSectionId === id || highlighted;
        const held = marked.has(id);
        const dim = Boolean(highlightSectionId) && !highlighted;
        return (
          <g
            key={id}
            className={interactive ? "cursor-pointer" : undefined}
            onClick={interactive && onSelect ? () => onSelect(id) : undefined}
            role={interactive ? "button" : undefined}
            tabIndex={interactive ? 0 : undefined}
            aria-label={
              section ? `${section.label}, ${formatPrice(section.price)}` : id
            }
            onKeyDown={
              interactive && onSelect
                ? (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelect(id);
                    }
                  }
                : undefined
            }
          >
            <rect
              x={box.x}
              y={box.y}
              width={box.w}
              height={box.h}
              rx="8"
              fill={FILL[section.roll]}
              fillOpacity={dim ? 0.18 : active ? 1 : held ? 0.9 : 0.62}
              stroke={active ? "#f8f7f4" : "rgba(255,255,255,0.2)"}
              strokeWidth={active ? 3 : 1}
            />
            <text
              x={box.x + box.w / 2}
              y={box.y + box.h / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#f8f7f4"
              fontSize={box.w < 100 ? 10 : 12}
              fontWeight="700"
              opacity={dim ? 0.35 : 1}
            >
              {formatPrice(section.price)}
            </text>
          </g>
        );
      })}

      <rect x="410" y="556" width="140" height="32" rx="4" fill="#f4efe4" />
      <rect x="190" y="588" width="580" height="74" rx="10" fill="#f8f7f4" />
      <rect x="190" y="588" width="580" height="10" fill="#d4af37" />
      <text
        x="480"
        y="632"
        textAnchor="middle"
        fill="#1a1020"
        fontSize="16"
        fontWeight="700"
        letterSpacing="8"
      >
        STAGE
      </text>
      <text x="480" y="700" textAnchor="middle" fill="#f8f7f4" fontSize="11" opacity="0.55">
        Stage is separate from the seats. Floor is in front. The bowl wraps both sides.
      </text>
    </svg>
  );
}
