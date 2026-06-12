import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, ProtectedRoute, AdminRoute } from "@/lib/auth";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import EventDetail from "@/pages/events/detail";
import MyEvents from "@/pages/events/my-events";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminEventsList from "@/pages/admin/events/list";
import AdminEventForm from "@/pages/admin/events/form";
import AdminEventParticipants from "@/pages/admin/events/participants";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/events/:id" component={EventDetail} />
        
        {/* Student Routes */}
        <Route path="/my-events">
          <ProtectedRoute>
            <MyEvents />
          </ProtectedRoute>
        </Route>

        {/* Admin Routes */}
        <Route path="/admin">
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        </Route>
        <Route path="/admin/events">
          <AdminRoute>
            <AdminEventsList />
          </AdminRoute>
        </Route>
        <Route path="/admin/events/new">
          <AdminRoute>
            <AdminEventForm />
          </AdminRoute>
        </Route>
        <Route path="/admin/events/:id/edit">
          <AdminRoute>
            <AdminEventForm />
          </AdminRoute>
        </Route>
        <Route path="/admin/events/:id/participants">
          <AdminRoute>
            <AdminEventParticipants />
          </AdminRoute>
        </Route>

        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
