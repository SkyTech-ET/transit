"use client";

import { useEffect } from "react";
import { Button, Card } from "antd";
import { useRouter } from "next/navigation";
import { authRoutes } from "@/modules/auth";

const ClientPage = () => {
  const router = useRouter();
  const routeTo = () => {
    router.push(authRoutes.login)
  }
  useEffect(() => { routeTo() }, [routeTo])

  return (
    <>
      <div className="flex flex-row justify-center">
        <div className="h-[700px] w-96 pt-20 md:pt-64">
          <Card title="TODO: Home page">
            <Button onClick={() => router.push(authRoutes.login)}>Login</Button>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ClientPage;
