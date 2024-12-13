"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Permission } from "@prisma/client";
import { Label } from "@radix-ui/react-label";
import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group";
import { Suspense, use } from "react";

export function EditUserPermissionDailog({
  children,
  permission,
}: {
  children: React.ReactNode;
  permission: Promise<Permission[]>;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑用户权限</DialogTitle>
        </DialogHeader>

        <Suspense fallback={<div>Loading...</div>}>
          <EditUserPermission permission={permission} />
        </Suspense>

        <DialogFooter>
          <Button>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 点击编辑，编辑用户的权限
export function EditUserPermission({
  permission,
}: {
  permission: Promise<Permission[]>;
}) {
  const data = use(permission);

  return (
    <div className="flex flex-col gap-2">
      <div>资源访问</div>

      <div className="flex flex-col gap-2">
        {data.map((p) => (
          <div className="flex space-x-2" key={p.id}>
            <div className="min-w-20">{p.resource}</div>

            <RadioGroup defaultValue="">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="r1" />
                <Label htmlFor="r1">all</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="read" id="r2" />
                <Label htmlFor="r2">read</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="write" id="r3" />
                <Label htmlFor="r3">Compact</Label>
              </div>
            </RadioGroup>
          </div>
        ))}
      </div>
    </div>
  );
}
