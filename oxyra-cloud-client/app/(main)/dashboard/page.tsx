

"use client";

import { useEffect, useState } from "react";

import useFetch from "@/hooks/useFetch";
import Loader from "@/components/ui/Loader";
import DashboardHeader from "./_components/DashboardHeader";
import ProjectGrid from "./_components/ProjectGrid";
import ProjectTable from "./_components/ProjectTable";
import ViewToggle, { ViewType } from "./_components/ViewToggle";
import { Section } from "@/components/ui/section";





export default function Dashboard() {
  const [view, setView] = useState<ViewType>("grid");
  const [search, setSearch] = useState("");
  const {
    data,
    error,
    isLoading,
    refetch
  } = useFetch({
    auto: true,
    url: `/api/project?query=${encodeURIComponent(search)}`,
  });

  const projects = Array.isArray(data) ? data : data?.projects || [];

  // Refetch when search changes
  useEffect(() => {
    refetch({ url: `/api/project?query=${encodeURIComponent(search)}` });
  }, [search]);

  return (
    <Section className="fade-bottom overflow-hidden pb-0 sm:pb-0 md:pb-0 pt-12!">
      <div className="max-w-container mx-auto flex flex-col  ">

        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8 items-end pt-8">
          <div className="flex-1 w-full">
            <DashboardHeader search={search} setSearch={setSearch} />
          </div>
          <ViewToggle view={view} setView={setView} />
        </div>
        {isLoading ? (
          <Loader text="Loading projects..." />
        ) : error ? (
          <div className="text-red-500 text-center py-8">{error}</div>
        ) : view === "grid" ? (
          <ProjectGrid projects={projects} />
        ) : (
          <ProjectTable projects={projects} />
        )}
      </div>
    </Section>
  );
}