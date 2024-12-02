"use server";

import z from "zod";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/db/prisma";
import bcrypt from "bcryptjs";
import { JwtUser } from "@/domain/jwt";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function loginAction(formData: FormData) {
  const username = formData.get("username");
  const password = formData.get("password");

  const parsed = loginSchema.safeParse({ username, password });

  if (!parsed.success) {
    return { error: "Invalid username or password" };
  }

  const user = await prisma.user.findUnique({
    where: { username: parsed.data.username },
  });

  if (!user) {
    return { error: "User not found" };
  }

  // 这里修改成 bcrypt.compareSync 来比较密码
  if (!bcrypt.compareSync(parsed.data.password, user.password)) {
    return { error: "Invalid password" };
  }

  const token = jwt.sign({ id: user.id } as JwtUser, process.env.JWT_SECRET as string, {
    expiresIn: "1d",
  });

  const cookieStore = await cookies();

  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(Date.now() + 1000 * 60 * 60),
  });

  redirect("/");
}