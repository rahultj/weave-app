'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ArtifactCard from './ArtifactCard';
import ConnectionSuggestion from './ConnectionSuggestion';
import { mockArtifacts, mockConnections, getPendingSuggestions, getArtifactById } from '@/lib/mock-data';

// This component uses mock data only - no auth required

export default function ArtifactFeed() {
  const router = useRouter();
  const [pendingSuggestions, setPendingSuggestions] = useState(getPendingSuggestions());
  const [artifacts, setArtifacts] = useState(mockArtifacts);

  const handleAcceptConnection = (connectionId: string) => {
    // In real implementation, this would call API
    console.log('Accepting connection:', connectionId);
    setPendingSuggestions(prev => prev.filter(s => s.id !== connectionId));
    // TODO: Update connection in database
  };

  const handleDismissConnection = (connectionId: string) => {
    console.log('Dismissing connection:', connectionId);
    setPendingSuggestions(prev => prev.filter(s => s.id !== connectionId));
    // TODO: Mark connection as rejected in database
  };

  const handleArtifactClick = (artifactId: string) => {
    router.push(`/artifact/${artifactId}`);
  };

  const handleEditArtifact = (artifactId: string) => {
    router.push(`/artifact/${artifactId}/edit`);
  };

  const handleChatAboutArtifact = (artifactId: string) => {
    router.push(`/chat?artifact=${artifactId}`);
  };

  const handleDeleteArtifact = (artifactId: string) => {
    // In real implementation, this would call API
    console.log('Deleting artifact:', artifactId);
    if (confirm('Are you sure you want to delete this artifact?')) {
      setArtifacts(prev => prev.filter(a => a.id !== artifactId));
      // TODO: Delete from database
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24">
      {/* Suggestions Section */}
      {pendingSuggestions.length > 0 && (
        <div className="mb-xl">
          <div className="flex items-center justify-between mb-md">
            <h2 className="text-h2 font-semibold text-neutral-text-primary">
              Suggestions for you
            </h2>
            <span className="text-caption text-neutral-text-muted">
              {pendingSuggestions.length} {pendingSuggestions.length === 1 ? 'connection' : 'connections'}
            </span>
          </div>

          <div className="space-y-md">
            {pendingSuggestions.map(suggestion => {
              const sourceArtifact = getArtifactById(suggestion.source_artifact_id);
              const targetArtifact = getArtifactById(suggestion.target_artifact_id);

              if (!sourceArtifact || !targetArtifact) return null;

              return (
                <ConnectionSuggestion
                  key={suggestion.id}
                  connection={suggestion}
                  sourceArtifact={sourceArtifact}
                  targetArtifact={targetArtifact}
                  onAccept={handleAcceptConnection}
                  onDismiss={handleDismissConnection}
                  onArtifactClick={handleArtifactClick}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Recently Discovered Artifacts */}
      <div>
        <h2 className="text-h2 font-semibold text-neutral-text-primary mb-md">
          Recently Discovered
        </h2>

        <div className="space-y-lg">
          {artifacts.map(artifact => (
            <ArtifactCard
              key={artifact.id}
              artifact={artifact}
              onClick={() => handleArtifactClick(artifact.id)}
              onDelete={async () => { handleDeleteArtifact(artifact.id) }}
            />
          ))}
        </div>

        {/* Empty State */}
        {artifacts.length === 0 && (
          <div className="text-center py-xxl">
            <p className="text-body text-neutral-text-secondary mb-md">
              No artifacts yet
            </p>
            <p className="text-caption text-neutral-text-muted">
              Start a conversation with Bobbin to discover cultural artifacts
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
