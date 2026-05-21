import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isTouchDevice = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(pointer: coarse)").matches;
