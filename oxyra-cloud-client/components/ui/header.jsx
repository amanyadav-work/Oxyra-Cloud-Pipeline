'use client';
import { ArrowUpRightSquare, Book, Coins, FlameIcon, Gamepad2Icon, LayoutDashboardIcon, LucideArrowUpRight, Menu, StarsIcon, Sunset, Trees, UserCircleIcon, Zap } from "lucide-react";
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


    const handleLogout = () => {
        router.push('/');
        localStorage.setItem('jwttoken', '');
        setUser(null)
    }
    return (
        <Section className="py-4!">
             <div className="max-w-container mx-auto flex flex-col gap-12 sm:gap-24">
              
                {/* Desktop Menu */}
                <nav className="hidden justify-between lg:flex relative">
                    <div className="flex items-center gap-6">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2">
                            {/* <img src="https://shadcnblocks.com/images/block/logos/shadcnblockscom-icon.svg" className="max-h-8" alt="logo" /> */}
                            <span className="text-md font-semibold text-red-500 dark:text-white">⨯Ᵽ
                            </span>
                        </Link>
                        <div className="flex items-center">
                            <NavigationMenu>
                                <NavigationMenuList>
                                    {/* Menu Items */}
                                    <NavigationMenuItem> <NavigationMenuLink href="/">Home</NavigationMenuLink></NavigationMenuItem>
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
                                                                <FlameIcon className="h-6 w-6" />
                                                                <p className="mb-2 mt-4 text-lg font-medium">
                                                                    ⨯Ᵽ exclusives
                                                                </p>
                                                                <p className="text-sm leading-tight text-muted-foreground">
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
                                                    <ListItem href="/docs/primitives/typography" title="Typography">
                                                        Styles for headings, paragraphs, lists...etc
                                                    </ListItem>
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
                                        <NavigationMenuLink href="#" className='flex flex-row gao-4 items-center'>Blog <LucideArrowUpRight className="inline" /></NavigationMenuLink>
                                    </NavigationMenuItem>
                                </NavigationMenuList>
                            </NavigationMenu>
                        </div>
                    </div>

                    {!(['/', '/login', '/register'].includes(pathname)) && (
                        <div className="flex absolute top-[50%] bottom-[50%] justify-center w-full gap-4 items-center text-xs">

                            <Link href="/dashboard">
                                <LayoutDashboardIcon
                                    size={17}
                                    className={`${pathname === "/dashboard" ? 'text-red-600 opacity-75 border rounded-full' : ''}`}
                                />
                            </Link>

                            <Link href="/tasks">
                                <Gamepad2Icon
                                    size={17}
                                    className={`${pathname === "/tasks" ? 'text-red-600 opacity-75 border rounded-full' : ''}`}
                                />
                            </Link>

                            <Link href="/collectibles">
                                <StarsIcon
                                    size={17}
                                    className={`${pathname === "/collectibles" ? 'text-red-600 opacity-75 border rounded-full' : ''}`}
                                />
                            </Link>

                            <Link href="/profile">
                                <UserCircleIcon
                                    size={17}
                                    className={`${pathname === "/profile" ? 'text-red-600 opacity-75 border rounded-full' : ''}`}
                                />
                            </Link>

                        </div>
                    )}


                    <div className="flex gap-2  items-center">
                        {user ?
                            <>
                                <ModeToggle classes='bg-background size-6 border-0 opacity-75' />
                                <div  id="xp-target"  className="flex gap h-fit min-w-[50px] items-center justify-between p-1 rounded-sm text-xs">
                                    <FlameIcon size={13} fill="red" color="black" /> <span className=" pl-0.5">{user.xp} </span> <span className="font-extrabold pl-0.5 ">XP</span>
                                </div>
                                <div id="coin-target" className="flex gap-1 h-fit min-w-[50px] hover:min-w-[126px] transition-all duration-400 items-center justify-between bg-muted px-3 py-1 rounded-sm text-xs">
                                    <Coins size={20} fill="yellow" color="black" />RK <span className=""> {user.coins} </span><Button className='p-1 size-4' ><Link href='/tasks'>+</Link></Button>
                                </div>
                                <DropdownMenu >
                                    <DropdownMenuTrigger><img src={user?.image} alt="" width={35} height={35} className="border-blue-700 hover:border-amber-500 p-[2px] rounded-full object-cover aspect-square" /></DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        {/* <DropdownMenuItem>Profile</DropdownMenuItem>
                                            <DropdownMenuItem>Billing</DropdownMenuItem>
                                            <DropdownMenuItem>Team</DropdownMenuItem> */}
                                        <DropdownMenuItem className='cursor-pointer' onClick={handleLogout}>Logout</DropdownMenuItem>
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
                            <FlameIcon className="size-4" />
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
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"

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