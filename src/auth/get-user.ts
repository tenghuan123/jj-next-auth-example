import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/db/prisma";
import { JwtUser } from "@/domain/jwt";

export async function getUser() {
    const token = (await cookies()).get("token")?.value;
    
    const payload = token ? jwt.verify(token, process.env.JWT_SECRET as string) : null;

    if(!payload) {
        return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: (payload as JwtUser).id },
    });

    if(!user) {
        return null;
    }

    return {
        id: user.id,
        username: user.username,
        email: user.email,
    };
}