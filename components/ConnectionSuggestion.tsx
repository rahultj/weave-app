'use client';

import { ArrowDownUp, X } from 'lucide-react';
import ArtifactCard from './ArtifactCard';
import { Connection, Artifact } from '@/lib/types/knowledge-graph';

export interface ConnectionSuggestionProps {
  connection: Connection;
  sourceArtifact: Artifact;
  targetArtifact: Artifact;
  onAccept: (connectionId: string) => void;
  onDismiss: (connectionId: string) => void;
  onArtifactClick?: (artifactId: string) => void;
}

const relationshipTypeLabels: Record<string, string> = {
  influenced_by: 'Influenced By',
  responds_to: 'Responds To',
  builds_on: 'Builds On',
  references: 'References',
  adapts: 'Adapts',
  samples: 'Samples',
  quotes: 'Quotes',
  explores_similar_themes: 'Explores Similar Themes',
  contrasts_with: 'Contrasts With',
  complements: 'Complements',
  uses_similar_technique: 'Uses Similar Technique',
  similar_style: 'Similar Style',
  same_genre: 'Same Genre',
  reminds_me_of: 'Reminds Me Of',
  pairs_well_with: 'Pairs Well With',
  discovered_through: 'Discovered Through'
};

export default function ConnectionSuggestion({
  connection,
  sourceArtifact,
  targetArtifact,
  onAccept,
  onDismiss,
  onArtifactClick
}: ConnectionSuggestionProps) {
  const relationshipLabel = relationshipTypeLabels[connection.relationship_type] || connection.relationship_type;
  const confidencePercent = Math.round(connection.strength * 100);

  return (
    <div className="bg-white rounded-card border border-neutral-border shadow-card overflow-hidden">
      {/* Header */}
      <div className="p-md border-b border-neutral-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center">
            <ArrowDownUp size={16} className="text-brand-primary" />
          </div>
          <div>
            <p className="text-body font-medium text-neutral-text-primary">
              Bobbin suggested a connection
            </p>
            <p className="text-caption text-neutral-text-muted">
              {connection.connection_source === 'ai_suggested' ? 'AI-suggested' :
               connection.connection_source === 'factual_reference' ? 'Factual reference' :
               'User discovered'}
            </p>
          </div>
        </div>
      </div>

      {/* Artifacts */}
      <div className="p-lg">
        {/* Source Artifact */}
        <div className="mb-md">
          <ArtifactCard
            artifact={sourceArtifact}
            variant="compact"
            onClick={onArtifactClick}
          />
        </div>

        {/* Connection Type */}
        <div className="flex items-center justify-center mb-md">
          <div className="flex items-center gap-2 px-4 py-2 bg-brand-primary/10 rounded-full">
            <ArrowDownUp size={14} className="text-brand-primary" />
            <span className="text-caption font-medium text-brand-primary">
              {relationshipLabel}
            </span>
          </div>
        </div>

        {/* Target Artifact */}
        <div className="mb-lg">
          <ArtifactCard
            artifact={targetArtifact}
            variant="compact"
            onClick={onArtifactClick}
          />
        </div>

        {/* Description */}
        {connection.description && (
          <div className="mb-md p-md bg-neutral-bg-main rounded-lg">
            <p className="text-caption font-medium text-neutral-text-secondary mb-xs">
              Why this connection?
            </p>
            <p className="text-body text-neutral-text-primary">
              {connection.description}
            </p>
          </div>
        )}

        {/* Confidence */}
        <div className="mb-lg">
          <div className="flex items-center justify-between mb-xs">
            <span className="text-caption text-neutral-text-muted">Confidence</span>
            <span className="text-caption font-medium text-neutral-text-primary">
              {confidencePercent}%
            </span>
          </div>
          <div className="h-2 bg-neutral-bg-hover rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-primary rounded-full transition-all"
              style={{ width: `${confidencePercent}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onAccept(connection.id)}
            className="flex-1 px-4 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-hover transition-colors text-body font-medium"
          >
            Accept Connection
          </button>
          <button
            onClick={() => onDismiss(connection.id)}
            className="px-4 py-3 text-neutral-text-muted hover:text-neutral-text-primary transition-colors"
            aria-label="Dismiss suggestion"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
