export type Role = "student" | "teacher";

export interface UserData {
  id: number;
  role: Role;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  gender: string;
  grade?: string;
}