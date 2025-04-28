import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/sonner";

const queryClient = new QueryClient();

export const Route = createRootRoute({
  component: () => (
    <>
      <QueryClientProvider client={queryClient}>
        <SidebarProvider>
          <div className="flex h-screen w-full overflow-hidden">
            <div className="flex-shrink-0">
              <AppSidebar />
            </div>
            <Toaster />
            <div className="flex-grow overflow-auto">
              <main className="container mx-auto p-6">
                <Outlet />
              </main>
            </div>
          </div>
        </SidebarProvider>
        <TanStackRouterDevtools />
        <ReactQueryDevtools buttonPosition="bottom-right" />
      </QueryClientProvider>
    </>
  ),
});
