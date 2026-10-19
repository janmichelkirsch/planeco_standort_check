import type { SVGProps } from "react";

/** Linien-Icons aus dem Figma-Make-Entwurf. Alle 24×24, Farbe über `currentColor`. */

type IconProps = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const ArrowRight = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Base>
);

export const ArrowLeft = (p: IconProps) => (
  <Base {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Base>
);

export const Search = (p: IconProps) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.2-4.2" />
  </Base>
);

export const Pin = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
    <circle cx="12" cy="10" r="2.3" />
  </Base>
);

export const Check = (p: IconProps) => (
  <Base {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Base>
);

export const CheckCircle = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8 12.3 2.7 2.7L16 9.7" />
  </Base>
);

export const Alert = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v5.5M12 16.3v.2" />
  </Base>
);

export const Pencil = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z" />
    <path d="m13.5 6.5 4 4" />
  </Base>
);

export const Spinner = ({ className = "", ...p }: IconProps) => (
  <Base className={`animate-spin ${className}`} {...p}>
    <path d="M12 3a9 9 0 1 0 9 9" />
  </Base>
);

// Dashboard

export const ChevronDown = (p: IconProps) => (
  <Base {...p}>
    <path d="m6 9 6 6 6-6" />
  </Base>
);

export const ChevronRight = (p: IconProps) => (
  <Base {...p}>
    <path d="m9 6 6 6-6 6" />
  </Base>
);

export const SortArrows = (p: IconProps) => (
  <Base {...p}>
    <path d="m8 9 4-4 4 4M16 15l-4 4-4-4" />
  </Base>
);

export const SortUp = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </Base>
);

export const SortDown = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 5v14M6 13l6 6 6-6" />
  </Base>
);

export const PhoneCall = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 4h3.5l1.8 4.5-2.3 1.4a11 11 0 0 0 6.1 6.1l1.4-2.3L20 15.5V19a1.5 1.5 0 0 1-1.6 1.5C10.6 20 4 13.4 3.5 5.6A1.5 1.5 0 0 1 5 4Z" />
  </Base>
);

export const PhoneOff = (p: IconProps) => (
  <Base {...p}>
    <path d="M10.3 8.5 8.5 4H5a1.5 1.5 0 0 0-1.5 1.6c.2 3 1.3 5.8 3 8.1M10 14a11 11 0 0 0 4.1 2l1.4-2.3 4.5 1.8V19a1.5 1.5 0 0 1-1.6 1.5 16 16 0 0 1-6.9-2" />
    <path d="M4 20 20 4" />
  </Base>
);

export const Mail = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="5.5" width="18" height="13" rx="2" />
    <path d="m4 7 8 6 8-6" />
  </Base>
);

export const Download = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 4v11M7 10.5l5 5 5-5M5 20h14" />
  </Base>
);

export const LogOut = (p: IconProps) => (
  <Base {...p}>
    <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 16l4-4-4-4M14 12H4" />
  </Base>
);

export const ExternalLink = (p: IconProps) => (
  <Base {...p}>
    <path d="M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
  </Base>
);

export const Clock = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5V12l3 2" />
  </Base>
);

export const X = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Base>
);

export const Refresh = (p: IconProps) => (
  <Base {...p}>
    <path d="M20 11a8 8 0 0 0-14.3-4.9L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16M20 20v-4h-4" />
  </Base>
);

export const UserPlus = (p: IconProps) => (
  <Base {...p}>
    <circle cx="9.5" cy="8" r="3.5" />
    <path d="M3 20a6.5 6.5 0 0 1 13 0M19 8v6M16 11h6" />
  </Base>
);

export const Users = (p: IconProps) => (
  <Base {...p}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.2a6.5 6.5 0 0 1 3.5 5.8" />
  </Base>
);

export const Inbox = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 13h5l1.5 3h5L16 13h5M5.5 5h13L21 13v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5l2.5-8Z" />
  </Base>
);

export const Link = (p: IconProps) => (
  <Base {...p}>
    <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
  </Base>
);

export const NotEqual = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 9.5h14M5 14.5h14M15.5 5l-7 14" />
  </Base>
);

export const Chart = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 20h16M7 16v-5M12 16V6M17 16v-8" />
  </Base>
);
