import {
  FolderGit2, Binary, Keyboard, Languages, Flame, Trophy, Check, Plus, Minus, Trash2, Pencil,
  X, Calendar, Settings as SettingsIcon, LayoutDashboard, TrendingUp, History, Sun, Moon,
  Monitor, Target, Clock, CheckCircle2, Circle, AlertCircle, ChevronLeft, ChevronRight,
  Sparkles, Award, BookOpen, Zap, RotateCcw, Bell, Globe, ListTodo, ArrowRight, Flame as FlameIcon,
  Users, Video, GraduationCap, Minus as MinusIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const MAP: Record<string, LucideIcon> = {
  FolderGit2, Binary, Keyboard, Languages, Flame, Trophy, Check, Plus, Minus, Trash2, Pencil,
  X, Calendar, Settings: SettingsIcon, LayoutDashboard, TrendingUp, History, Sun, Moon,
  Monitor, Target, Clock, CheckCircle2, Circle, AlertCircle, ChevronLeft, ChevronRight,
  Sparkles, Award, BookOpen, Zap, RotateCcw, Bell, Globe, ListTodo, ArrowRight, FlameIcon,
  Users, Video, GraduationCap, MinusIcon,
};

export function Icon({ name, className, size, strokeWidth }: { name: string; className?: string; size?: number; strokeWidth?: number }) {
  const C = MAP[name] ?? Circle;
  return <C className={className} size={size} strokeWidth={strokeWidth} />;
}
