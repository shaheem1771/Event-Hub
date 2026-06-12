import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Calendar, ArrowRight, Loader2, GraduationCap, ShieldCheck } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["student", "admin"]),
  studentId: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.role === "student" && (!data.studentId || data.studentId.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Student ID is recommended for students",
      path: ["studentId"],
    });
  }
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const { login: setAuthContext } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const register = useRegister();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "student",
      studentId: "",
    },
  });

  const selectedRole = form.watch("role");

  const onSubmit = (data: RegisterFormValues) => {
    setServerError(null);
    register.mutate(
      { data: {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        studentId: data.studentId || undefined
      } },
      {
        onSuccess: (res) => {
          setAuthContext(res.token, res.user);
          toast.success("Account created successfully!");
          
          if (res.user.role === "admin") {
            setLocation("/admin");
          } else {
            setLocation("/");
          }
        },
        onError: (err) => {
          setServerError(err.data?.error || "An error occurred during registration");
        },
      }
    );
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4 bg-muted/30 py-12">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground mb-4 shadow-lg shadow-primary/20">
            <Calendar className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-center">Join LBSCEK Event Hub</h1>
          <p className="text-muted-foreground mt-2 text-center">Create an account to discover and manage events</p>
        </div>

        <div className="bg-card border shadow-xl shadow-black/5 rounded-2xl p-6 md:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {serverError && (
                <div className="p-3 text-sm font-medium bg-destructive/10 text-destructive rounded-lg text-center">
                  {serverError}
                </div>
              )}
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>I am a...</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-2 gap-4"
                      >
                        <FormItem>
                          <FormControl>
                            <RadioGroupItem value="student" className="peer sr-only" />
                          </FormControl>
                          <FormLabel className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer">
                            <GraduationCap className="mb-2 h-6 w-6 text-primary" />
                            <span className="font-semibold">Student</span>
                          </FormLabel>
                        </FormItem>
                        <FormItem>
                          <FormControl>
                            <RadioGroupItem value="admin" className="peer sr-only" />
                          </FormControl>
                          <FormLabel className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer">
                            <ShieldCheck className="mb-2 h-6 w-6 text-primary" />
                            <span className="font-semibold">Admin</span>
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4 pt-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane Doe" className="h-11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="you@university.edu" type="email" className="h-11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedRole === "student" && (
                  <FormField
                    control={form.control}
                    name="studentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student ID <span className="text-muted-foreground font-normal">(Optional)</span></FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 12345678" className="h-11" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" className="h-11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full h-12 text-base font-semibold group mt-6" disabled={register.isPending}>
                {register.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
