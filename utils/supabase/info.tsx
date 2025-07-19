let projectId: string | undefined;
let publicAnonKey: string | undefined;

// Use a custom env variable to detect Deno Deploy
if (
// @ts-ignore
  typeof Deno !== 'undefined' &&
  // @ts-ignore
  Deno.env.get('NEXT_PUBLIC_DENO_ENV') === 'true'
) {
  // Deno Deploy environment
  // @ts-ignore
  projectId = Deno.env.get('NEXT_PUBLIC_SUPABASE_PROJECT_ID');
  // @ts-ignore
  publicAnonKey = Deno.env.get('NEXT_PUBLIC_SUPABASE_ANON_KEY');
} else {
  // Standard Node/Next.js environment
  projectId = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID;
  publicAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export { projectId, publicAnonKey };