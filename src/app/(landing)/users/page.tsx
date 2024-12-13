import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/db/prisma";
import { EditUserPermissionDailog } from "./edit-user-permission";

export default async function UserPage() {
  const user = await prisma.user.findMany();

  return (
    <div className="flex flex-col space-y-4 p-4">
      <h1 className="text-2xl font-bold">用户管理</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Id</TableHead>
            <TableHead>用户名</TableHead>
            <TableHead>邮箱</TableHead>
            <TableHead>创建时间</TableHead>
            <TableHead className="text-center">操作</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {user.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.createdAt.toLocaleDateString()}</TableCell>
              <TableCell>
                <EditUserPermissionDailog
                  permission={prisma.permission.findMany()}
                >
                  <Button variant="link">编辑</Button>
                </EditUserPermissionDailog>
                <Button variant="link">删除</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
