import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/db/prisma";
import { JwtUser } from "@/domain/jwt";

export async function getUser() {
    const token = (await cookies()).get("accessToken")?.value;

    if(!token){
        return null; // 无token，直接返回null
    }
    
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as JwtUser | null

    if(!payload || !payload.id) {
        return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, username: true, email: true }
    });

    return user
}