"use client";

import { type React } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "@/components/theme-provider";
import { DragDropProvider } from "@/components/drag-drop-context";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Database, Briefcase } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
}

export function Layout({ children, showHeader = false }: LayoutProps) {
  const pathname = usePathname();
  const isDatasets = pathname === "/datasets/";
  const isJobs = pathname === "/jobs/";

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <DragDropProvider>
        <div className="min-h-screen bg-background">
          {/* Header */}
          {showHeader && (
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* OpenMined Logo */}
                    <div className="flex items-center space-x-2">
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 556 556"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M478.246 162.258L278.023 277.997L77.7996 162.258L278.023 46.5185L478.246 162.258Z"
                          fill="url(#paint0_linear_345_360)"
                        />
                        <path
                          d="M478.246 162.258V393.737L278.023 509.482V277.997L478.246 162.258Z"
                          fill="url(#paint1_linear_345_360)"
                        />
                        <path
                          d="M278.023 277.997V509.482L77.7996 393.737V162.258L278.023 277.997Z"
                          fill="url(#paint2_linear_345_360)"
                        />
                        <defs>
                          <linearGradient
                            id="paint0_linear_345_360"
                            x1="77.7996"
                            y1="162.258"
                            x2="478.246"
                            y2="162.258"
                            gradientUnits="userSpaceOnUse"
                          >
                            <stop stopColor="#DC7A6E" />
                            <stop offset="0.251496" stopColor="#F6A464" />
                            <stop offset="0.501247" stopColor="#FDC577" />
                            <stop offset="0.753655" stopColor="#EFC381" />
                            <stop offset="1" stopColor="#B9D599" />
                          </linearGradient>
                          <linearGradient
                            id="paint1_linear_345_360"
                            x1="475.8"
                            y1="162.258"
                            x2="278.023"
                            y2="509.482"
                            gradientUnits="userSpaceOnUse"
                          >
                            <stop stopColor="#BFCD94" />
                            <stop offset="0.245025" stopColor="#B2D69E" />
                            <stop offset="0.504453" stopColor="#8DCCA6" />
                            <stop offset="0.745734" stopColor="#5CB8B7" />
                            <stop offset="1" stopColor="#4CA5B8" />
                          </linearGradient>
                          <linearGradient
                            id="paint2_linear_345_360"
                            x1="77.7996"
                            y1="162.258"
                            x2="278.023"
                            y2="509.482"
                            gradientUnits="userSpaceOnUse"
                          >
                            <stop stopColor="#D7686D" />
                            <stop offset="0.225" stopColor="#C64B77" />
                            <stop offset="0.485" stopColor="#A2638E" />
                            <stop offset="0.703194" stopColor="#758AA8" />
                            <stop offset="1" stopColor="#639EAF" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <span className="text-xl font-bold">OpenMined</span>
                    </div>

                    <div className="text-muted-foreground">×</div>

                    {/* ndl-gov-data Logo */}
                    <div className="flex items-center space-x-2">
                      <svg
                        width="17"
                        height="33"
                        viewBox="0 0 17 33"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                        className="fill-primary w-4 h-8"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M7.55551 13.9211L3.4428 10.7284C1.2693 9.04122 0 6.44509 0 3.69551V0.5L4.11203 3.69208C6.28416 5.37855 7.55551 7.97468 7.55551 10.7236V13.9211Z"
                        ></path>
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M9.29004 13.9211L13.4007 10.7284C15.5742 9.04122 16.8435 6.44509 16.8435 3.69551V0.5L12.7328 3.69208C10.5593 5.37855 9.29004 7.97468 9.29004 10.7236V13.9211Z"
                        ></path>
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M7.55551 23.2094L3.4428 20.018C1.2693 18.3316 0 15.7354 0 12.9852V9.78827L4.11203 12.9831C6.28416 14.6689 7.55551 17.2643 7.55551 20.0153V23.2094Z"
                        ></path>
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M9.29004 23.2094L13.4007 20.018C15.5742 18.3316 16.8435 15.7354 16.8435 12.9852V9.78827L12.7328 12.9831C10.5593 14.6689 9.29004 17.2643 9.29004 20.0153V23.2094Z"
                        ></path>
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M7.55551 32.5L3.4428 29.3079C1.2693 27.6201 0 25.0246 0 22.2757V19.0789L4.11203 22.2716C6.28416 23.9581 7.55551 26.5542 7.55551 29.3038V32.5Z"
                        ></path>
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M9.29004 32.5L13.4007 29.3079C15.5742 27.6201 16.8435 25.0246 16.8435 22.2757V19.0789L12.7328 22.2716C10.5593 23.9581 9.29004 26.5542 9.29004 29.3038V32.5Z"
                        ></path>
                      </svg>
                      <span className="text-xl font-bold text-primary">
                        ndl.gov.uk
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <ModeToggle />
                  </div>
                </div>
              </div>
            </header>
          )}

          {/* Navigation */}
          <nav className="container animate-fade-in mx-auto px-4 py-8">
            <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
              <Link href="/datasets">
                <Button
                  variant={isDatasets ? "default" : "ghost"}
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Database className="h-4 w-4" />
                  <span>Datasets</span>
                </Button>
              </Link>
              <Link href="/jobs">
                <Button
                  variant={isJobs ? "default" : "ghost"}
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Briefcase className="h-4 w-4" />
                  <span>Jobs</span>
                </Button>
              </Link>
            </div>
          </nav>

          {/* Main Content */}
          <main className="container mx-auto px-4 py-8">{children}</main>
        </div>
      </DragDropProvider>
    </ThemeProvider>
  );
}
