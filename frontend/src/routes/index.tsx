import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { LoginForm } from "@/components/ivy/LoginForm";
import { PropertiesPage } from "@/components/ivy/PropertiesPage";
import { authService, type AuthSession } from "@/services/auth";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Ivy Homes | Chennai Properties" },
    { name: "description", content: "Discover thoughtfully curated properties for sale across Chennai with Ivy Homes." },
    { property: "og:title", content: "Ivy Homes | Chennai Properties" },
    { property: "og:description", content: "Discover thoughtfully curated properties for sale across Chennai with Ivy Homes." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: Index,
});
function Index(){const [session,setSession]=useState<AuthSession|null>(null);if(!session)return <LoginForm onSuccess={setSession}/>;return <PropertiesPage session={session} onLogout={async()=>{await authService.signOut();setSession(null)}}/>}
