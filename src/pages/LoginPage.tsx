import { Building2, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setLoading(true);
		try {
			await signIn(email, password);
			navigate("/", { replace: true }); // App will redirect to correct role dashboard
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Login failed. Please try again.",
			);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
			<Card className="w-full max-w-sm rounded-none border shadow-none">
				<CardHeader className="space-y-3 text-center">
					<div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
						<Building2 className="h-5 w-5 text-primary" />
					</div>
					<div>
						<CardTitle className="text-xl">Sign in</CardTitle>
						<CardDescription>
							Enter your credentials to access your dashboard
						</CardDescription>
					</div>
				</CardHeader>

				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4" noValidate>
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="you@hostel.edu.gh"
								autoComplete="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<div className="relative">
								<Input
									id="password"
									type={showPassword ? "text" : "password"}
									placeholder="Enter your password"
									autoComplete="current-password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									className="pr-10"
								/>
								<button
									type="button"
									onClick={() => setShowPassword((prev) => !prev)}
									className="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-muted-foreground hover:text-foreground"
									tabIndex={-1}
									aria-label={showPassword ? "Hide password" : "Show password"}
								>
									{showPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</button>
							</div>
						</div>

						{error && (
							<div className="rounded-none border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
								{error}
							</div>
						)}

						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Signing in…
								</>
							) : (
								"Sign in"
							)}
						</Button>
					</form>

					<Link
						to="/forgot-password"
						className="mt-4 block text-center text-sm text-muted-foreground hover:text-foreground hover:underline"
					>
						Forgot password?
					</Link>
				</CardContent>
			</Card>
		</div>
	);
}
