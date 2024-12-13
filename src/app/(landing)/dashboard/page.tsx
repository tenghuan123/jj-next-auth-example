import { getUser } from "@/components/auth/get-user";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div>
      <h1>Hello World {user.user.username}</h1>
    </div>
  );
}
