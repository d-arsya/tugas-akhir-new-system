import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { User, Settings as SettingsIcon, ShieldCheck } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent, RojaCard } from "@roja/ui"

import ProfileSection from "@/components/setting/ProfileSection"
import PasswordSection from "@/components/setting/PasswordSection"
import TwoFactorSection from "@/components/setting/TwoFactorSection"
import EmailVerifySection from "@/components/setting/EmailVerifySection"
import { useMerchantProfile } from "@/hooks/use-merchant-queries"

export const Route = createFileRoute("/_member/setting")({
	component: SettingRouteComponent,
})

function SettingRouteComponent(): JSX.Element {
	const { data: profile } = useMerchantProfile()


	const hasUnverifiedEmail = !profile?.emailVerifiedAt && Boolean(profile?.email)

	return (
		<div className="w-full max-w-3xl">
			<RojaCard className="p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 bg-white">
				{/* 1:1 Legacy Icon-Only Tabs (`tbr_tabs`) */}
				<Tabs defaultValue="merchant" className="w-full space-y-6">
					<TabsList className="flex w-auto inline-flex bg-transparent border-b border-slate-200 p-0 rounded-none gap-6 pb-2">
						{/* Tab 1: Merchant Profile Icon */}
						<TabsTrigger
							value="merchant"
							title="Profil Merchant"
							className="pb-3 px-2 text-slate-400 data-[state=active]:text-[#e4007e] data-[state=active]:border-b-2 data-[state=active]:border-[#e4007e] bg-transparent rounded-none transition-colors cursor-pointer"
						>
							<User className="w-6 h-6" />
						</TabsTrigger>

						{/* Tab 2: Personal & Email Icon (with red dot if unverified email) */}
						<TabsTrigger
							value="personal"
							title="Informasi & Email"
							className="relative pb-3 px-2 text-slate-400 data-[state=active]:text-[#e4007e] data-[state=active]:border-b-2 data-[state=active]:border-[#e4007e] bg-transparent rounded-none transition-colors cursor-pointer"
						>
							<SettingsIcon className="w-6 h-6" />
							{hasUnverifiedEmail && (
								<span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#e4007e] ring-2 ring-white" />
							)}
						</TabsTrigger>

						{/* Tab 3: Security & 2FA Icon */}
						<TabsTrigger
							value="security"
							title="Keamanan & 2FA"
							className="pb-3 px-2 text-slate-400 data-[state=active]:text-[#e4007e] data-[state=active]:border-b-2 data-[state=active]:border-[#e4007e] bg-transparent rounded-none transition-colors cursor-pointer"
						>
							<ShieldCheck className="w-6 h-6" />
						</TabsTrigger>
					</TabsList>

					{/* Tab 1: Merchant Profile Info */}
					<TabsContent value="merchant" className="mt-0 pt-2">
						<ProfileSection
							initialMerchantName={profile?.merchantName || ""}
							initialPhone={profile?.phone || ""}
							initialAddress={profile?.address || ""}
						/>
					</TabsContent>

					{/* Tab 2: Personal Info & Email */}
					<TabsContent value="personal" className="mt-0 pt-2">
						<EmailVerifySection
							email={profile?.email || ""}
							isVerified={Boolean(profile?.emailVerifiedAt)}
						/>
					</TabsContent>

					{/* Tab 3: Security, Password & 2FA */}
					<TabsContent value="security" className="mt-0 pt-2 space-y-6">
						<PasswordSection />
						<TwoFactorSection initialEnabled={profile?.enabled2fa ?? true} />
					</TabsContent>
				</Tabs>
			</RojaCard>
		</div>
	)
}

export default Route
