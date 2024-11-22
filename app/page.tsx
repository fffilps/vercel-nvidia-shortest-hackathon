import GithubActivityTracker from './components/GithubActivityTracker';
export default function Home() {

  return (
    <div className="min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          GitHub Repository Activity Tracker
        </h1>
        <GithubActivityTracker />
      </main>
    </div>
  );
}
