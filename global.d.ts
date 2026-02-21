// CSS and Assets Type Declarations
// This file defines TypeScript types for CSS imports and other assets

/**
 * CSS Module Type Declaration
 * Allows importing .css files in TypeScript without errors
 */
declare module '*.css' {
  const content: { [className: string]: string }
  export default content
}

/**
 * CSS Module Type Declaration (for .module.css files)
 * Supports scoped CSS modules
 */
declare module '*.module.css' {
  const classes: { [key: string]: string }
  export default classes
}

/**
 * PostCSS Tailwind Support
 * Allows importing Tailwind CSS via @tailwindcss/postcss
 */
declare module '@tailwindcss/postcss'

/**
 * Tailwind Animations Support
 * Allows importing animations from tw-animate-css
 */
declare module 'tw-animate-css'

/**
 * SVG Import Support
 * Allows importing SVG files as React components
 */
declare module '*.svg' {
  import type { ReactElement, SVGProps } from 'react'
  const SVG: (props: SVGProps<SVGElement> & { title?: string }) => ReactElement
  export default SVG
}

/**
 * Image Import Support
 * Allows importing image files
 */
declare module '*.png' {
  const content: string
  export default content
}

declare module '*.jpg' {
  const content: string
  export default content
}

declare module '*.jpeg' {
  const content: string
  export default content
}

declare module '*.gif' {
  const content: string
  export default content
}

declare module '*.webp' {
  const content: string
  export default content
}
