"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";


export default function DashboardHeader({ search, setSearch }: { search: string; setSearch: (v: string) => void }) {
  const router = useRouter();

  return (
    <div >
      <div className="flex-1 w-full">
        <Label htmlFor="search">Search Projects</Label>
        <div className="flex flex-col mt-2 sm:flex-row justify-between gap-4 items-center ">
          <Input
            id="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Type to search..."
            autoComplete="off"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="default" onClick={() => router.push("/project/import")}>Add New</Button>
            </DropdownMenuTrigger>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
