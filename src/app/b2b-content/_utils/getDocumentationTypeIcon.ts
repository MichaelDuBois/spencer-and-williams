import {
  AppWindow,
  Blocks,
  BookOpen,
  GraduationCap,
  LibraryBig,
  Lightbulb,
  ListChecks,
  Plug,
  ScanText,
  Settings2,
  SquareFunction,
  Terminal,
  Variable,
  Waypoints,
  Wrench,
} from 'lucide-react'
import { createElement } from 'react'

import type { LucideIcon, LucideProps } from 'lucide-react'

const DOCUMENTATION_TYPE_ICONS: Record<string, LucideIcon> = {
  guide: BookOpen,
  integration: Plug,
  method: SquareFunction,
  widget: AppWindow,
  how_to: ListChecks,
  parameter: Variable,
  in_depth: ScanText,
  tool: Wrench,
  framework_integration: Blocks,
  solution: Lightbulb,
  tutorial: GraduationCap,
  rest_api: Waypoints,
  api_client: Terminal,
  glossary: LibraryBig,
  crawler_parameter: Settings2,
}

export const getDocumentationTypeIcon = (
  type: string | null | undefined,
  props?: LucideProps,
) => {
  const Icon =
    DOCUMENTATION_TYPE_ICONS[type?.trim().toLowerCase() ?? ''] ?? BookOpen

  return createElement(Icon, props)
}
