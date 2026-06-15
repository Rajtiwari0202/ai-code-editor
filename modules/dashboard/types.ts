import type { PlaygroundTemplate } from "./contracts";

export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: "ADMIN" | "USER" | "PREMIUM_USER";
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  title: string;
  description: string | null;
  template: PlaygroundTemplate;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  user: User;
  starMarks: { isMarked: boolean }[];
}
