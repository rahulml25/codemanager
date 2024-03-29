import React from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Dialogs from "@/components/Dialogs";

type Props = {};

export default function Loading({}: Props) {
  return (
    <div className="flex">
      <Sidebar />

      <main className="grow">
        <Header />
        <h1 className="font-xl">Loading...</h1>
      </main>

      <Dialogs />
    </div>
  );
}
