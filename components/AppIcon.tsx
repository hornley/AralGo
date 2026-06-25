import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BookCopy,
  BookText,
  BookOpen,
  BookOpenCheck,
  BookOpenText,
  Bot,
  Brain,
  Calculator,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  Compass,
  ClipboardCheck,
  Dumbbell,
  FileText,
  Flag,
  Flame,
  FlaskConical,
  Folder,
  Footprints,
  GraduationCap,
  History,
  House,
  Info,
  Languages,
  Leaf,
  LibraryBig,
  Lightbulb,
  List,
  MessageCircle,
  MessageSquare,
  MessagesSquare,
  Mic,
  NotebookText,
  Palette,
  Paperclip,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Save,
  ScanText,
  Settings,
  Smartphone,
  Sparkles,
  SlidersHorizontal,
  StickyNote,
  Text,
  Trash2,
  TriangleAlert,
  TrendingUp,
  Upload,
  User,
  X,
} from "lucide-react";

type AppIconName =
  | "add"
  | "arrow_back"
  | "arrow_forward"
  | "arrow_forward_ios"
  | "arrow_upward"
  | "attach_file"
  | "auto_awesome"
  | "auto_stories"
  | "calculate"
  | "chat"
  | "chat_bubble"
  | "check"
  | "check_circle"
  | "checklist"
  | "child_care"
  | "chevron_right"
  | "close"
  | "delete"
  | "description"
  | "document_scanner"
  | "directions_run"
  | "edit"
  | "energy_savings_leaf"
  | "expand_more"
  | "explore"
  | "fact_check"
  | "fitness_center"
  | "flag"
  | "folder"
  | "forum"
  | "help"
  | "history"
  | "home"
  | "import_contacts"
  | "info"
  | "keyboard_arrow_down"
  | "lightbulb"
  | "list_alt"
  | "local_fire_department"
  | "local_library"
  | "menu_book"
  | "mic"
  | "person"
  | "play_arrow"
  | "psychology"
  | "quiz"
  | "refresh"
  | "rule"
  | "save"
  | "schedule"
  | "school"
  | "science"
  | "settings"
  | "show_chart"
  | "signal_cellular_alt"
  | "smart_toy"
  | "stars"
  | "sticky_note_2"
  | "style"
  | "summarize"
  | "tune"
  | "topic"
  | "translate"
  | "upload_file"
  | "warning"
  | "exercise"
  | "book_2"
  | "attachment";

const iconMap: Record<AppIconName, ComponentType<LucideProps>> = {
  add: Plus,
  arrow_back: ArrowLeft,
  arrow_forward: ArrowRight,
  arrow_forward_ios: ChevronRight,
  arrow_upward: ArrowUp,
  attach_file: Paperclip,
  auto_awesome: Sparkles,
  auto_stories: BookOpenText,
  calculate: Calculator,
  chat: MessageSquare,
  chat_bubble: MessageCircle,
  check: Check,
  check_circle: CheckCircle,
  checklist: BookOpenCheck,
  child_care: GraduationCap,
  chevron_right: ChevronRight,
  close: X,
  delete: Trash2,
  description: FileText,
  document_scanner: ScanText,
  directions_run: Footprints,
  edit: Pencil,
  energy_savings_leaf: Leaf,
  expand_more: ChevronDown,
  explore: Compass,
  fact_check: ClipboardCheck,
  fitness_center: Dumbbell,
  flag: Flag,
  folder: Folder,
  forum: MessagesSquare,
  help: CircleHelp,
  history: History,
  home: House,
  import_contacts: BookCopy,
  info: Info,
  keyboard_arrow_down: ChevronDown,
  lightbulb: Lightbulb,
  list_alt: List,
  local_fire_department: Flame,
  local_library: LibraryBig,
  menu_book: BookOpen,
  mic: Mic,
  person: User,
  play_arrow: Play,
  psychology: Brain,
  quiz: CircleHelp,
  refresh: RefreshCw,
  rule: CheckCircle,
  save: Save,
  schedule: Clock3,
  school: GraduationCap,
  science: FlaskConical,
  settings: Settings,
  show_chart: TrendingUp,
  signal_cellular_alt: Smartphone,
  smart_toy: Bot,
  stars: Sparkles,
  sticky_note_2: StickyNote,
  style: Palette,
  summarize: Text,
  tune: SlidersHorizontal,
  topic: NotebookText,
  translate: Languages,
  upload_file: Upload,
  warning: TriangleAlert,
  exercise: BookText,
  book_2: BookOpen,
  attachment: Paperclip,
};

type AppIconProps = Omit<LucideProps, "ref"> & {
  name: AppIconName | string;
};

export function AppIcon({ name, className, size = "1em", strokeWidth = 2, ...props }: AppIconProps) {
  const Icon = iconMap[name as AppIconName] ?? CircleHelp;
  return (
    <Icon
      aria-hidden="true"
      className={className}
      size={size}
      strokeWidth={strokeWidth}
      {...props}
    />
  );
}
