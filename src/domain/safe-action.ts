import { createSafeActionClient } from "next-safe-action";
import { cookies } from "next/headers";
import { Exception, UnauthorizedException } from "./exception";
import { getUser } from "@/components/auth/get-user";

export const actionClient = createSafeActionClient({
  handleServerError: (error: any) => {
    if (error instanceof Exception) {
      return {
        code: error.code,
        message: error.message,
        data: error.response,
      };
    }

    return {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error",
      data: error,
    };
  },
});

export const authActionClient = actionClient.use(async (next: any) => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken");

  if (!accessToken) {
    throw new UnauthorizedException("Unauthorized", {
      code: "UNAUTHORIZED",
      message: "Unauthorized",
    });
  }

  const user = await getUser();

  return next({ ctx: { user } });
});
