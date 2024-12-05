"use client";

import Link from "next/link";
import { loginAction } from "@/auth/actions";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-5">
      <h1 className="text-2xl font-bold">Login</h1>
      <form
        className="flex flex-col items-center justify-center space-y-5"
        onSubmit={async (ev) => {
          ev.preventDefault();
          const result = await loginAction(new FormData(ev.currentTarget));
          console.log(result);
        }}
      >
        <input className="border border-gray-300 rounded-md p-2 text-neutral-700" type="text" name="username" placeholder="Username" />
        <input className="border border-gray-300 rounded-md p-2 text-neutral-700" type="password" name="password" placeholder="Password" />

        <div className="flex flex-col items-center justify-center space-y-5">
            <p className="space-x-2">
                <span className="text-neutral-500">Don't have an account?</span>
                <Link className="text-blue-500" href="/register">Register</Link>
            </p>
            <button className="bg-blue-500 text-white p-2 rounded-md" type="submit">Login</button>
        </div>
      </form>
    </div>
  );
}
