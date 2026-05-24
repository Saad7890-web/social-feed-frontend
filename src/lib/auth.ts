import type { LoginPayload, RegisterPayload, User } from "../types/auth";
import { request, unwrap } from "./api";

type AuthResponse = {
  user: User;
};

export async function getCurrentUser() {
  const payload = await request<AuthResponse>({
    method: "get",
    url: "/auth/me",
  });

  return unwrap(payload).user;
}

export async function loginUser(input: LoginPayload) {
  const payload = await request<AuthResponse>({
    method: "post",
    url: "/auth/login",
    data: input,
  });

  return unwrap(payload).user;
}

export async function registerUser(input: RegisterPayload) {
  const payload = await request<AuthResponse>({
    method: "post",
    url: "/auth/register",
    data: input,
  });

  return unwrap(payload).user;
}

export async function logoutUser() {
  await request<{ message: string }>({
    method: "post",
    url: "/auth/logout",
  });
}
