import { Headphones, Watch, Camera, Gamepad2, Lamp, Plug, Package, Cpu, Smartphone, Book } from "lucide-react";

const ICONS = {
  headphones: Headphones,
  watch: Watch,
  camera: Camera,
  gamepad: Gamepad2,
  home: Lamp,
  plug: Plug,
  cpu: Cpu,
  devices: Smartphone,
  book: Book,
  drone: Camera,
};

export default function CategoryIcon({ name, className = "h-5 w-5" }) {
  const Icon = ICONS[name] || Package;
  return <Icon className={className} strokeWidth={1.8} />;
}
