"use client";

import { registerAction } from "./action";


export default function RegisterPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-5">
      <h1 className="text-2xl font-bold">Register</h1>
      <form
        className="flex flex-col items-center justify-center space-y-5"
        onSubmit={async (ev) => {
            ev.preventDefault();
            const formData = new FormData(ev.currentTarget);
            const result = await registerAction(formData);
            console.log(result);
        }}
      >
        <input className="border border-gray-300 rounded-md p-2 text-neutral-700" type="text" name="username" placeholder="Username" />
        <input className="border border-gray-300 rounded-md p-2 text-neutral-700" type="password" name="password" placeholder="Password" />
        <input className="border border-gray-300 rounded-md p-2 text-neutral-700" type="email" name="email" placeholder="Email" />
        <button className="bg-blue-500 text-white p-2 rounded-md" type="submit">Register</button>
      </form>
    </div>
  );
}
