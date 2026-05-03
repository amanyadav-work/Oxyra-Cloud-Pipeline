"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import useFetch from "@/hooks/useFetch";

// Shadcn UI Dialog components (inline for this file)
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface DeleteProjectDangerZoneProps {
    projectID: string;
    projectName?: string;
}


export default function DeleteProjectDangerZone({ projectID, projectName }: DeleteProjectDangerZoneProps) {
    const router = useRouter();

    const [success, setSuccess] = React.useState(false);
    const [open, setOpen] = React.useState(false);
    const { isLoading, error, refetch } = useFetch({
        auto: false,
        url: projectID ? `/api/project/${projectID}` : '',
        method: "DELETE",
        onSuccess: () => {
            setSuccess(true);
            toast.success("Project Deleted Successfully!");
            router.push("/dashboard");
        },
    });

    const handleDelete = () => {
        if (!projectID) return;
        setSuccess(false);
        refetch();
    };

    return (
        <>
            <div className="border-2 border-red-800 rounded-xl p-6 flex flex-row justify-between items-center gap-3">
                <div className="flex flex-col">
                    <div className="font-semibold  text-lg mb-1">Danger Zone</div>
                    <div className="text-sm  mb-2">
                        This action <span className="font-bold">cannot be undone</span>. This will permanently delete the project
                        {projectName ? <span> <span className="">{projectName}</span></span> : null} and all its data.
                    </div>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button
                            variant="destructive"
                            className="w-fit mt-2"
                            onClick={() => setOpen(true)}
                            disabled={isLoading}
                        >
                            {isLoading ? "Deleting..." : "Delete Project"}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Project</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete
                                {projectName ? <span> <span className="font-bold">{projectName}</span></span> : " this project"}?<br />
                                This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    setOpen(false);
                                    handleDelete();
                                }}
                                disabled={isLoading}
                            >
                                {isLoading ? "Deleting..." : "Confirm Delete"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            {error && <div className="text-sm text-red-500">{error}</div>}
        </>
    );
}
