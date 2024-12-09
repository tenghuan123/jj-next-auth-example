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
}

export async function logoutAction() {
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
}

export async function refreshTokenAction(refreshToken: string) {
    try {
        // 验证 Refresh Token
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET as string) as JwtUser;

        // 删除过期的 Refresh Token
        await prisma.refreshToken.deleteMany({
          where: { expiresAt: { lt: new Date() } },
        });
    
        // 查询数据库确保 Refresh Token 有效
        const storedToken = await prisma.refreshToken.findUnique({
          where: { token: refreshToken },
        });
    
        if (!storedToken) {
          throw new Error("Invalid refresh token");
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
      } catch (error) {
        console.log(error);
        return { error: "Invalid or expired refresh token" };
      }
}

const registerSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(1),
    email: z.string().email(),
  });

export const registerAction = async (formData: FormData) => {
    const username = formData.get('username')?.toString() ?? '';
    const password = formData.get('password')?.toString() ?? '';
    const email = formData.get('email')?.toString() ?? '';

    if(!registerSchema.safeParse({ username, password, email }).success) {
        return { error: "Invalid username or password" };
    }

    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [
                { username },
                { email }
            ]
        }
    });

    if(existingUser) {
        return { 
            error: existingUser.username === username 
                ? "username already exists" 
                : "email already exists"
        };
    }
    
    // 嘿，这地方需要加密密码哦, 这里的环境变量 process.env.BCRYPT_SALT = 10
    try {
        await prisma.user.create({
            data: { username, email, password: bcrypt.hashSync(password, Number(process.env.BCRYPT_SALT)) },
        })
    } catch (error) {
        return { error: (error as Error).message };
    }

    return { success: true };
}
