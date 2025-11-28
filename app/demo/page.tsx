import ArtifactFeed from '@/components/ArtifactFeed';
import SimpleInput from '@/components/SimpleInput';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-neutral-bg-main">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-neutral-border">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <h1 className="text-h1 font-bold text-neutral-text-primary">weave</h1>
          <p className="text-caption text-neutral-text-muted">Knowledge Graph Demo</p>
        </div>
      </div>

      {/* Simple Input */}
      <SimpleInput placeholder="What interests you?" />

      {/* Artifact Feed */}
      <div className="py-6">
        <ArtifactFeed />
      </div>
    </div>
  );
}
