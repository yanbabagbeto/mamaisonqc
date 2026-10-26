import type { SVGProps } from "react";

export type IllustrationDimension = number | string;

/**
 * Props shared by every illustration in this folder.
 *
 * - `width` / `height` are real SVG attributes, so a component scales without a wrapper.
 *   Prefer `className="h-auto w-full"` (Tailwind) over fixed pixel sizes inside layouts.
 * - `title` turns the SVG into a labelled image (`role="img"` + `<title>`). Omit it when the
 *   asset is decorative — the default — because every slot already carries visible text.
 * - Any other `<svg>` attribute (aria-*, id, data-*) is forwarded.
 */
export type IllustrationProps = Omit<
  SVGProps<SVGSVGElement>,
  "width" | "height" | "viewBox" | "title" | "children"
> & {
  className?: string;
  width?: IllustrationDimension;
  height?: IllustrationDimension;
  title?: string;
};

/**
 * Accessibility attributes for an illustration. Decorative is the default: the SVGs sit next
 * to real headings and labels, so announcing them again would be noise for screen readers.
 */
export function illustrationA11y(title?: string) {
  return title
    ? ({ role: "img", focusable: "false" } as const)
    : ({ "aria-hidden": true, focusable: "false" } as const);
}
