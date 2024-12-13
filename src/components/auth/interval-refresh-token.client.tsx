"use client";

import { useEffect } from "react";
import { refreshTokenAction } from "./actions";

const REFRESH_TOKEN_INTERVAL = 1000 * 60 * 1;
const TIME_OFFSET = 1000 * 60 * 3;

export default function IntervalRefreshToken({
  accessTokenExp,
  refreshToken,
}: {
  accessTokenExp: number;
  refreshToken: string;
}) {
  useEffect(() => {
    // 检查并刷新 accessToken
    const refresh = async () => {
      if (Date.now() > accessTokenExp * 1000 - TIME_OFFSET) {
        await refreshTokenAction({ refreshToken });
      }
    };

    // 每1分钟检查一次,确保在token过期前刷新
    const interval = setInterval(refresh, REFRESH_TOKEN_INTERVAL);

    // 组件卸载时清理定时器
    return () => clearInterval(interval);
  }, []);

  return (
    <button
      onClick={() => {
        refreshTokenAction({ refreshToken });
      }}
    >
      刷新token
    </button>
  );
}
