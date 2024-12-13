"use server";

import z from "zod";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/db/prisma";
import bcrypt from "bcryptjs";
import { JwtUser } from "@/domain/jwt";
import { actionClient } from "@/domain/safe-action";
import { Exception } from "@/domain/exception";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

function generateAccessToken(user: JwtUser) {
  return jwt.sign(user, process.env.JWT_SECRET as string, {
    expiresIn: "15m",
  });
}

function generateRefreshToken(user: JwtUser) {
  return jwt.sign(user, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });
}

export const loginAction = actionClient
  .schema(loginSchema)
  .action(async ({ parsedInput }) => {
    const user = await prisma.user.findUnique({
      where: { username: parsedInput.username },
    });

    if (!user) {
      throw new Exception("USER_NOT_FOUND", "User not found");
    }

    if (!bcrypt.compareSync(parsedInput.password, user.password)) {
      throw new Exception("INVALID_PASSWORD", "Invalid password");
    }

    const userPayload: JwtUser = { id: user.id };

    const accessToken = generateAccessToken(userPayload);
    const refreshToken = generateRefreshToken(userPayload);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
      },
    });

    const cookieStore = await cookies();

    cookieStore.set("accessToken", accessToken, {
      httpOnly: true, // 防止xss攻击
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(Date.now() + 1000 * 60 * 15), // 15 minutes
    });

    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true, // 防止xss攻击
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
    });

    redirect("/");
  });

export const logoutAction = actionClient.action(async () => {
  const cookieStore = await cookies();

  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (refreshToken) {
    // 从数据库中移除 Refresh Token
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
  redirect("/login");
});

export const refreshTokenAction = actionClient
  .schema(
    z.object({
      refreshToken: z.string().min(1),
    }),
  )
  .action(async ({ parsedInput }) => {
    // 验证 Refresh Token
    const decoded = jwt.verify(
      parsedInput.refreshToken,
      process.env.JWT_SECRET as string,
    ) as JwtUser;

    // 查询数据库确保 Refresh Token 有效
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: parsedInput.refreshToken },
    });

    if (!storedToken) {
      throw new Exception("INVALID_REFRESH_TOKEN", "Invalid refresh token");
    }

    // 生成新的 Access Token
    const newAccessToken = generateAccessToken({ id: decoded.id });

    // 设置新的 Access Token 到 Cookies
    const cookieStore = await cookies();

    cookieStore.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 15, // 15分钟
    });

    return { accessToken: newAccessToken };
  });

const registerSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  email: z.string().email(),
});

export const registerAction = actionClient
  .schema(registerSchema)
  .action(async ({ parsedInput }) => {
    const { username, password, email } = parsedInput;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      throw new Exception("USER_ALREADY_EXISTS", "User already exists");
    }

    // 嘿，这地方需要加密密码哦, 这里的环境变量 process.env.BCRYPT_SALT = 10
    try {
      await prisma.user.create({
        data: {
          username,
          email,
          password: bcrypt.hashSync(password, Number(process.env.BCRYPT_SALT)),
        },
      });
    } catch (error) {
      throw new Exception("INTERNAL_SERVER_ERROR", "Internal server error");
    }

    return { success: true };
  });
