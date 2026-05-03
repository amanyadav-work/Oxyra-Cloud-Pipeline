// "use client";
// import { useState } from "react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import Loader from "@/components/ui/Loader";

// const schema = z.object({
//   name: z.string().min(2, "Name is required"),
//   description: z.string().optional(),
//   url: z.string().url("Must be a valid URL"),
//   repo: z.string().min(2, "Repo is required"),
//   lastUpdate: z.string().optional(),
//   branch: z.string().optional(),
//   rootDir: z.string().default("/"),
//   buildCmd: z.string().default("npm run build"),
//   outputDir: z.string().default("dist"),
//   installCmd: z.string().default("npm install"),
// });

// export type ProjectFormValues = z.infer<typeof schema>;

// export default function AddProjectDialog({ open, setOpen, onSuccess }: { open: boolean; setOpen: (v: boolean) => void; onSuccess?: () => void }) {
//   const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ProjectFormValues>({
//     resolver: zodResolver(schema),
//     defaultValues: {
//       rootDir: "/",
//       buildCmd: "npm run build",
//       outputDir: "dist",
//       installCmd: "npm install",
//     },
//   });
//   const [error, setError] = useState<string | null>(null);

//   const onSubmit = async (values: ProjectFormValues) => {
//     setError(null);
//     try {
//       const res = await fetch("/api/project", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(values),
//       });
//       if (!res.ok) throw new Error("Failed to add project");
//       reset();
//       setOpen(false);
//       onSuccess?.();
//     } catch (e: any) {
//       setError(e.message || "Unknown error");
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Add New Project</DialogTitle>
//         </DialogHeader>
//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//           {/* General Info */}
//           <div>
//             <div className="font-semibold mb-2">General Info</div>
//             <div className="grid gap-3">
//               <div>
//                 <Label htmlFor="name">Name</Label>
//                 <Input id="name" {...register("name")} placeholder="Project Name" />
//                 {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
//               </div>
//               <div>
//                 <Label htmlFor="description">Description</Label>
//                 <Input id="description" {...register("description")} placeholder="Short description" />
//                 {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
//               </div>
//             </div>
//           </div>
//           {/* Repository Info */}
//           <div>
//             <div className="font-semibold mb-2">Repository</div>
//             <div className="grid gap-3">
//               <div>
//                 <Label htmlFor="repo">GitHub Repo</Label>
//                 <Input id="repo" {...register("repo")} placeholder="username/repo" />
//                 {errors.repo && <p className="text-xs text-red-500">{errors.repo.message}</p>}
//               </div>
//               <div>
//                 <Label htmlFor="url">Project URL</Label>
//                 <Input id="url" {...register("url")} placeholder="https://project-url" />
//                 {errors.url && <p className="text-xs text-red-500">{errors.url.message}</p>}
//               </div>
//               <div>
//                 <Label htmlFor="branch">Branch</Label>
//                 <Input id="branch" {...register("branch")} placeholder="main" />
//                 {errors.branch && <p className="text-xs text-red-500">{errors.branch.message}</p>}
//               </div>
//             </div>
//           </div>
//           {/* Build Settings */}
//           <div>
//             <div className="font-semibold mb-2">Build Settings</div>
//             <div className="grid gap-3">
//               <div>
//                 <Label htmlFor="rootDir">Root Directory</Label>
//                 <Input id="rootDir" {...register("rootDir")} placeholder="/" />
//                 {errors.rootDir && <p className="text-xs text-red-500">{errors.rootDir.message}</p>}
//               </div>
//               <div>
//                 <Label htmlFor="buildCmd">Build Command</Label>
//                 <Input id="buildCmd" {...register("buildCmd")} placeholder="npm run build" />
//                 {errors.buildCmd && <p className="text-xs text-red-500">{errors.buildCmd.message}</p>}
//               </div>
//               <div>
//                 <Label htmlFor="outputDir">Output Directory</Label>
//                 <Input id="outputDir" {...register("outputDir")} placeholder="dist" />
//                 {errors.outputDir && <p className="text-xs text-red-500">{errors.outputDir.message}</p>}
//               </div>
//               <div>
//                 <Label htmlFor="installCmd">Install Command</Label>
//                 <Input id="installCmd" {...register("installCmd")} placeholder="npm install" />
//                 {errors.installCmd && <p className="text-xs text-red-500">{errors.installCmd.message}</p>}
//               </div>
//             </div>
//           </div>
//           {error && <div className="text-red-500 text-center">{error}</div>}
//           <DialogFooter>
//             <Button type="submit" size="sm" disabled={isSubmitting}>
//               {isSubmitting ? <Loader size={16} /> : "Add Project"}
//             </Button>
//           </DialogFooter>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }
