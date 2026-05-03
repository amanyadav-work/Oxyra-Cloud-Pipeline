"use client";
import useFetch from "@/hooks/useFetch";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import Loader from "@/components/ui/Loader";
import FormField from "@/components/ui/FormField";
import { User, Link, Folder, Terminal, Box, Download, CloudyIcon } from "lucide-react";
import GitHub from '@mui/icons-material/GitHub';
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Section } from "@/components/ui/section";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
const schema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
  repo: z.string().min(2, "Repo is required"),
  subdomain: z.string().min(2, "Subdomain is required"),
  lastUpdate: z.string().optional(),
  branch: z.string().optional(),
  status: z.string().optional(),
  rootDir: z.string().default("/"),
  buildCmd: z.string().default("npm run build"),
  outputDir: z.string().default("dist"),
  installCmd: z.string().default("npm install"),
});

export type ProjectFormValues = z.infer<typeof schema>;

export default function ImportProjectPage() {
  const router = useRouter();

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ProjectFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      rootDir: "/",
      buildCmd: "npm run build",
      outputDir: "dist",
      installCmd: "npm install",
    },
  });
  const {
    data,
    error,
    isLoading,
    refetch: submitProject
  } = useFetch({
    auto: false,
    url: "/api/project",
    method: "POST",
    onSuccess: (res) => {
      toast.success(res.message || "Project imported successfully!");
      router.push(`/project/${res.project_id}/logs`);
      reset();
    },
    onError: (err) => toast.error(err.message || "Failed to import project"),
  });

  const onSubmit = async (values: ProjectFormValues) => {
    await submitProject({ payload: values });
  };

  return (
    <Section className="fade-bottom overflow-hidden pb-0 sm:pb-0 md:pb-0 py-12!">
      <div className="max-w-container mx-auto flex flex-col  ">

          <div className="w-full dark:bg-zinc-900/80 rounded-2xl shadow-xl flex flex-col md:flex-row overflow-hidden border border-zinc-200 dark:border-zinc-800">
            {/* Right: Form (placed first for flex-row-reverse for height sync) */}
            <div id="import-form-col" className="md:w-1/2 flex flex-col justify-start pb-6 md:pb-10 ">
              <h1 className="text-lg font-semibold text-left border-b mb-6 py-5 px-6 md:px-10">Deploy Project</h1>
              <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-8 px-6 md:px-10">
                {/* General Info */}
                <div>
                  <div className="grid gap-5">
                    <FormField
                      id="name"
                      label="Name"
                      icon={<Box size={15} />}
                      placeholder="Project Name"
                      register={register}
                      errors={errors}
                    />
                    <FormField
                      id="description"
                      label="Description"
                      isTextArea
                      // icon={<Box size={15} />}
                      placeholder="Short description"
                      register={register}
                      errors={errors}
                    />
                  </div>
                </div>
                {/* Accordion for Repository Info and Build Settings */}
                <Accordion type="multiple" className="space-y-0">
                  <AccordionItem value="repository">
                    <AccordionTrigger className="font-semibold mb-2">Repository</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid gap-3">
                        <FormField
                          id="repo"
                          label="GitHub Repo"
                          icon={<GitHub fontSize="small" />}
                          placeholder="username/repo"
                          register={register}
                          errors={errors}
                        />
                        <FormField
                          id="subdomain"
                          label="Subdomain"
                          icon={<Link size={15} />}
                          placeholder="e.g. myapp"
                          register={register}
                          errors={errors}
                        />
                        <FormField
                          id="branch"
                          label="Branch"
                          icon={<GitHub fontSize="small" />}
                          placeholder="main"
                          register={register}
                          errors={errors}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="build">
                    <AccordionTrigger className="font-semibold mb-2">Build Settings</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid gap-3">
                        <FormField
                          id="rootDir"
                          label="Root Directory"
                          icon={<Folder size={15} />}
                          placeholder="/"
                          register={register}
                          errors={errors}
                        />
                        <FormField
                          id="buildCmd"
                          label="Build Command"
                          icon={<Terminal size={15} />}
                          placeholder="npm run build"
                          register={register}
                          errors={errors}
                        />
                        <FormField
                          id="outputDir"
                          label="Output Directory"
                          icon={<Download size={15} />}
                          placeholder="dist"
                          register={register}
                          errors={errors}
                        />
                        <FormField
                          id="installCmd"
                          label="Install Command"
                          icon={<Terminal size={15} />}
                          placeholder="npm install"
                          register={register}
                          errors={errors}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                {error && <div className="text-red-500 text-center">{error}</div>}
                {data && <div className="text-green-600 text-center">Project imported successfully!</div>}
                <div className="flex justify-end">
                  <Button type="submit" size="sm" disabled={isLoading}>
                    {isLoading ? <Loader size={16} /> : "Import Project"}
                  </Button>
                </div>
              </form>
            </div>

            {/* Left: Video/Visual */}
            <div className="md:w-1/2 h-auto flex flex-col items-center justify-center dark:from-zinc-900 dark:to-zinc-800 relative min-h-0">
              <div className="flex-1 relative flex items-stretch w-full">
                <video
                  src="/projectadd.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover dark:saturate-10"
                  style={{ height: '100%', maxHeight: '100%' }}
                />
                <CloudyIcon size={100} strokeWidth={2} fill="skyblue" className="absolute  top-1/2 -translate-y-1/2 left-0 right-0 place-self-center text-primary p-6 bg-white/50 backdrop-blur-md rounded-full border-8 border-primary/50"/>
              </div>
            </div>
          </div>
      </div>
    </Section>
  );
}
