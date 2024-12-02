"use server";

import { prisma } from "@/db/prisma";
import z from "zod";
import bcrypt from "bcryptjs";

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
