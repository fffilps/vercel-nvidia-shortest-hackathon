import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import GithubActivityTracker from '@/app/components/GithubActivityTracker'


export default async function Home() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    redirect('/login')
  }

  if (!user) {
    redirect('/login')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <GithubActivityTracker />
    </main>
  )
}
