import Header from "@/components/ui/header"

const MainLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <main className="bg-background text-foreground min-h-screen w-full">
            <Header />
            {children}
        </main>
    )
}

export default MainLayout