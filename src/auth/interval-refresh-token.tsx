import { cookies } from "next/headers";
import IntervalRefreshTokenClient from "./interval-refresh-token.client";
import jwt from "jsonwebtoken";

export default async function IntervalRefreshToken() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if(!accessToken || !refreshToken) {
        return null;
    }

    const accessTokenExp = jwt.decode(accessToken);

    if(!accessTokenExp || typeof accessTokenExp == 'string' || !accessTokenExp.exp) {
        return null;
    }

    return <IntervalRefreshTokenClient key={refreshToken} accessTokenExp={accessTokenExp.exp} refreshToken={refreshToken} />
}
