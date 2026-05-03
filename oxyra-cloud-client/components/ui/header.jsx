'use client';
import { CloudyIcon, Gamepad2Icon, LayoutDashboardIcon, LucideArrowUpRight, Menu, StarsIcon, Sunset, Trees, UserCircleIcon, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ModeToggle } from "./mode-toggle";
import Link from "next/link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { Section } from "./section";
import { toast } from "sonner";


const components = [
    {
        title: "Alert Dialog",
        href: "/docs/primitives/alert-dialog",
        description:
            "A modal dialog that interrupts the user with important content and expects a response.",
    },
    {
        title: "Hover Card",
        href: "/docs/primitives/hover-card",
        description:
            "For sighted users to preview content available behind a link.",
    },
    {
        title: "Progress",
        href: "/docs/primitives/progress",
        description:
            "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
    },
    {
        title: "Scroll-area",
        href: "/docs/primitives/scroll-area",
        description: "Visually or semantically separates content.",
    },
    {
        title: "Tabs",
        href: "/docs/primitives/tabs",
        description:
            "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
    },
    {
        title: "Tooltip",
        href: "/docs/primitives/tooltip",
        description:
            "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
    },
]

const Header = () => {
    const { user, setUser } = useUser()
    const router = useRouter();
    const pathname = usePathname();


    const handleLogout = async () => {
        const res = await fetch('/api/logout', { method: 'POST', credentials: 'include' });
        if (res.ok) {
            router.push('/');
            setUser(null)
        } else {
            toast.error('Failed to logout');
        }
    }
    return (
        <Section className="py-4! border-b ">
            <div className="max-w-container h-12! justify-center  mx-auto flex flex-col gap-12 sm:gap-24">

                {/* Desktop Menu */}
                <nav className="hidden justify-between lg:flex relative">
                    <div className="flex items-center gap-6">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2">
                            {/* <img src="https://shadcnblocks.com/images/block/logos/shadcnblockscom-icon.svg" className="max-h-8" alt="logo" /> */}
                            <div className="text-base flex flex-row items-center gap-2 w-fit font-semibold text-primary dark:text-white">
                                <CloudyIcon size={20} fill="skyblue" />
                                <p>
                                    Oxyra
                                </p>
                            </div>
                        </Link>
                        <div className="flex items-center">
                            <NavigationMenu>
                                <NavigationMenuList>
                                    {/* Menu Items */}
                                    <NavigationMenuItem > <NavigationMenuLink className="py-2" href="/">Home</NavigationMenuLink></NavigationMenuItem>
                                    {(['/', '/login', '/register'].includes(pathname)) && <>
                                        <NavigationMenuItem>
                                            <NavigationMenuTrigger>What&apos;s in the box</NavigationMenuTrigger>
                                            <NavigationMenuContent>
                                                <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                                                    <li className="row-span-3">
                                                        <NavigationMenuLink asChild>
                                                            <Link
                                                                className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md" style={{ backgroundImage: 'url(Random/_5c4cb1c1-b0b5-4276-bff0-7be640204e87.jpeg)', boxShadow: 'inset 0px -130px 90px 5px var(--background)' }}
                                                                href="/"
                                                            >
                                                                <CloudyIcon className="h-6 w-6 text-foreground" fill="skyblue"/>
                                                                <p className="mb-2 mt-4 text-lg font-medium">
                                                                    Oxyra exclusives
                                                                </p>
                                                                <p className="text-sm leading-tight  text-center text-muted-foreground">
                                                                    Beautifully designed components built with Radix UI and
                                                                    Tailwind CSS.
                                                                </p>
                                                            </Link>
                                                        </NavigationMenuLink>
                                                    </li>
                                                    <ListItem href="/docs" title="Introduction">
                                                        Re-usable components built using Radix UI and Tailwind CSS.
                                                    </ListItem>
                                                    <ListItem href="/docs/installation" title="Installation">
                                                        How to install dependencies and structure your app.
                                                    </ListItem>
                                                    {/* <ListItem href="/docs/primitives/typography" title="Typography">
                                                        Styles for headings, paragraphs, lists...etc
                                                    </ListItem> */}
                                                </ul>
                                            </NavigationMenuContent>
                                        </NavigationMenuItem>
                                        <NavigationMenuItem>
                                            <NavigationMenuTrigger>Company</NavigationMenuTrigger>
                                            <NavigationMenuContent>
                                                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                                                    {components.map((component) => (
                                                        <ListItem
                                                            key={component.title}
                                                            title={component.title}
                                                            href={component.href}
                                                        >
                                                            {component.description}
                                                        </ListItem>
                                                    ))}
                                                </ul>
                                            </NavigationMenuContent>
                                        </NavigationMenuItem>
                                    </>
                                    }


                                    <NavigationMenuItem>
                                        <NavigationMenuLink href="#" className='flex flex-row gap-2 py-2 items-center'>Blog <LucideArrowUpRight className="inline" /></NavigationMenuLink>
                                    </NavigationMenuItem>
                                </NavigationMenuList>
                            </NavigationMenu>
                        </div>
                    </div>

                    {!(['/', '/login', '/register'].includes(pathname)) && user && (
                        <div className="flex items-center justify-end gap-2 px-4 py-2 w-full ">
                            <Link href="/dashboard" className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${pathname === "/dashboard" ? "bg-primary text-primary-foreground" : "hover:bg-accent text-muted-foreground"}`}>
                                <LayoutDashboardIcon size={16} /> Dashboard
                            </Link>
                            <Link href="/profile" className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${pathname === "/profile" ? "bg-primary text-primary-foreground" : "hover:bg-accent text-muted-foreground"}`}>
                                <UserCircleIcon size={16} /> Profile
                            </Link>
                        </div>
                    )}


                    <div className="flex gap-2  items-center">
                        {user ?
                            <>
                                <ModeToggle classes='bg-background size-6 border-0 opacity-75' />
                                <DropdownMenu>
                                    <DropdownMenuTrigger>
                                        {user?.image ? (
                                            <img src={user.image} alt="" width={35} height={35} className="border-blue-700 hover:border-amber-500 p-[2px] rounded-full object-cover aspect-square" />
                                        ) : (
                                            <div className="flex items-center justify-center w-[35px] h-[35px] rounded-full bg-muted text-primary font-bold border-blue-700 hover:border-amber-500 border p-[2px]">
                                                {(user?.name?.[0] || user?.email?.[0] || "U").toUpperCase()}
                                            </div>
                                        )}
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link href="/dashboard" className="flex items-center gap-2">
                                                <LayoutDashboardIcon size={16} /> Dashboard
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/profile" className="flex items-center gap-2">
                                                <UserCircleIcon size={16} /> Profile
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className='cursor-pointer flex items-center gap-2' onClick={handleLogout}>
                                            <Zap size={16} /> Logout
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                            : <>
                                <Button asChild variant="outline" size="sm">
                                    <Link href="/login">Login</Link>
                                </Button>
                                <Button asChild size="sm">
                                    <Link href="/register">Sign up</Link>
                                </Button>
                                <ModeToggle />
                            </>
                        }
                    </div>
                </nav>

                {/* Mobile Menu */}
                <div className="block lg:hidden">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2">
                            {/* <img src="https://shadcnblocks.com/images/block/logos/shadcnblockscom-icon.svg" className="max-h-8" alt="logo" /> */}
                            <CloudyIcon className="size-4" />
                        </Link>
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <Menu className="size-4" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent className="overflow-y-auto">
                                <SheetHeader>
                                    <SheetTitle>
                                        <Link href="https://www.shadcnblocks.com" className="flex items-center gap-2">
                                            <img src="https://shadcnblocks.com/images/block/logos/shadcnblockscom-icon.svg" className="max-h-8" alt="logo" />
                                        </Link>
                                    </SheetTitle>
                                </SheetHeader>
                                <div className="flex flex-col gap-6 p-4">
                                    <Button asChild variant="outline">
                                        <Link href="/login">Login</Link>
                                    </Button>
                                    <Button asChild>
                                        <Link href="/register">Sign up</Link>
                                    </Button>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </Section>
    );
};

export default Header;



const ListItem = (({ className, title, children, ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <a
                    ref={ref}
                    className={
                        " select-none space-y-1 flex flex-col items-start rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"

                    }
                    {...props}
                >
                    <div className="text-sm font-medium leading-none">{title}</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {children}
                    </p>
                </a>
            </NavigationMenuLink>
        </li>
    )
})
ListItem.displayName = "ListItem"