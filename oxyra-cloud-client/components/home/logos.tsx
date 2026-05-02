import { ReactNode } from "react";

import { siteConfig } from "@/config/site";

import { Rocket, Cloud, GitBranch, Zap, Database } from "lucide-react";
import { Badge } from "../ui/badge";
import { Section } from "../ui/section";

interface LogosProps {
  title?: string;
  badge?: ReactNode | false;
  logos?: ReactNode[] | false;
  className?: string;
}

export default function Logos({
  title = "Built with industry-standard tools and best practices",
  badge = (
    <Badge variant="outline" className="border-brand/30 text-brand">
      Last updated: {siteConfig.stats.updated}
    </Badge>
  ),
  logos = [
    <Logo key="rocket" image={Rocket} name="Rocket" version="1.0" />,
    <Logo key="cloud" image={Cloud} name="Cloud" version="2.1" />,
    <Logo key="git-branch" image={GitBranch} name="Git Branch" version="3.2" />,
    <Logo key="zap" image={Zap} name="Zap" version="4.5" />,
    <Logo key="database" image={Database} name="Database" version="5.0" />,
  ],
  className,
}: LogosProps) {
  return (
    <Section className={className}>
      <div className="max-w-container mx-auto flex flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-6">
          {badge !== false && badge}
          <h2 className="text-md font-semibold sm:text-2xl">{title}</h2>
        </div>
        {logos !== false && logos.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-8">
            {logos}
          </div>
        )}
      </div>
    </Section>
  );
}

  // New Logo component for Lucide icons
  import { cn } from "@/lib/utils";

  interface LucideLogoProps {
    image: React.ComponentType<{ className?: string; size?: number }>;
    name: string;
    version?: string;
    badge?: React.ReactNode;
    showName?: boolean;
    width?: number;
    height?: number;
    className?: string;
  }

  function Logo({
    image: SvgIcon,
    name,
    version,
    badge,
    showName = true,
    width = 24,
    height = 24,
    className,
    ...props
  }: LucideLogoProps) {
    return (
      <div
        data-slot="logo"
        className={cn("flex items-center gap-2 text-sm font-medium", className)}
        {...props}
      >
        <SvgIcon size={width} aria-hidden="true" className="max-h-full max-w-full opacity-70" />
        <span className={cn(!showName && "sr-only")}>{name}</span>
        {version && <span className="text-muted-foreground">{version}</span>}
        {badge && (
          <Badge variant="outline" >
            {badge}
          </Badge>
        )}
      </div>
    );
  }