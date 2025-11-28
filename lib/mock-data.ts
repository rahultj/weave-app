// Mock data for testing knowledge graph components

import { Artifact, Connection, Concept } from './types/knowledge-graph';

export const mockArtifacts: Artifact[] = [
  {
    id: 'artifact-1',
    user_id: 'user-1',
    type: 'album',
    title: 'MOTOMAMI',
    creator: 'Rosalía',
    year: 2022,
    medium: 'Album',
    user_notes: 'Experimental blend of flamenco, reggaeton, and electronic music. References "Carrier Bag Theory of Fiction" in the concept. Challenges music industry conventions.',
    status: 'explored',
    discovered_via: 'conversation-1',
    discovered_at: '2025-08-28T10:30:00Z',
    image_url: 'https://upload.wikimedia.org/wikipedia/en/8/8c/Rosal%C3%ADa_-_Motomami.png',
    external_links: [
      { type: 'spotify', url: 'https://open.spotify.com/album/5DXCTbMSkCmEzLVTWxd0Ph' }
    ],
    metadata: {
      label: 'Columbia Records',
      runtime_minutes: 42,
      genre: ['experimental', 'flamenco', 'reggaeton']
    },
    created_at: '2025-08-28T10:30:00Z',
    updated_at: null
  },
  {
    id: 'artifact-2',
    user_id: 'user-1',
    type: 'book',
    title: 'The Dispossessed',
    creator: 'Ursula K. Le Guin',
    year: 1974,
    medium: 'Novel',
    user_notes: 'Powerful exploration of anarchist utopia and the challenges of creating alternative social structures. The dual narrative structure really emphasizes the contrast between worlds.',
    status: 'explored',
    discovered_via: 'conversation-1',
    discovered_at: '2025-08-25T14:00:00Z',
    image_url: 'https://upload.wikimedia.org/wikipedia/en/f/fc/The_Dispossessed_%281st_ed_cover%29.jpg',
    external_links: [
      { type: 'goodreads', url: 'https://www.goodreads.com/book/show/13651.The_Dispossessed' }
    ],
    metadata: {
      isbn: '978-0-06-051275-0',
      pages: 400,
      publisher: 'Harper & Row',
      genre: ['science fiction', 'political fiction']
    },
    created_at: '2025-08-25T14:00:00Z',
    updated_at: null
  },
  {
    id: 'artifact-3',
    user_id: 'user-1',
    type: 'essay',
    title: 'The Carrier Bag Theory of Fiction',
    creator: 'Ursula K. Le Guin',
    year: 1986,
    medium: 'Essay',
    user_notes: '"If it is a human thing to do to put something you want, because it\'s useful, edible, or beautiful, into a bag, or a basket, or a bit of rolled bark or leaf, or a net woven of your own hair, or what have you, and then take it home with you, home being another, larger kind of pouch or bag, a container for people, and then later on you take it out and eat it or share it or store it up for winter in a solider container or put it in the medicine bundle or the shrine or the museum, the holy place, the area that contains what is sacred, and then the next day you probably do much the same again—if to do that is human, if that\'s what it takes, then I am a human being after all."',
    status: 'want_to_explore',
    discovered_via: 'conversation-1',
    discovered_at: '2025-08-28T11:00:00Z',
    image_url: null,
    external_links: [],
    metadata: {
      publication: 'Dancing at the Edge of the World',
      word_count: 3000
    },
    created_at: '2025-08-28T11:00:00Z',
    updated_at: null
  },
  {
    id: 'artifact-4',
    user_id: 'user-1',
    type: 'book',
    title: 'Babel',
    creator: 'R.F. Kuang',
    year: 2022,
    medium: 'Novel',
    user_notes: '"Translation means doing violence upon the original, means warping and distorting it for foreign, untutored eyes"',
    status: 'exploring',
    discovered_via: null,
    discovered_at: null,
    image_url: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1654272973i/60095384.jpg',
    external_links: [],
    metadata: {
      isbn: '978-0063021426',
      pages: 560,
      publisher: 'Harper Voyager',
      genre: ['historical fantasy', 'dark academia']
    },
    created_at: '2025-08-20T09:00:00Z',
    updated_at: null
  },
  {
    id: 'artifact-5',
    user_id: 'user-1',
    type: 'film',
    title: 'Everything Everywhere All at Once',
    creator: 'Daniel Kwan, Daniel Scheinert',
    year: 2022,
    medium: 'Film',
    user_notes: 'Mind-bending exploration of multiverse and identity. The way it blends genres reminded me of how Rosalía blends musical styles.',
    status: 'explored',
    discovered_via: null,
    discovered_at: null,
    image_url: 'https://upload.wikimedia.org/wikipedia/en/1/1e/Everything_Everywhere_All_at_Once.jpg',
    external_links: [],
    metadata: {
      runtime_minutes: 139,
      genre: ['science fiction', 'comedy', 'action']
    },
    created_at: '2025-08-15T16:00:00Z',
    updated_at: null
  }
];

export const mockConnections: Connection[] = [
  {
    id: 'connection-1',
    user_id: 'user-1',
    source_artifact_id: 'artifact-1', // MOTOMAMI
    target_artifact_id: 'artifact-3', // Carrier Bag Theory
    relationship_type: 'references',
    description: 'Explicitly referenced in album liner notes and concept',
    connection_source: 'factual_reference',
    user_accepted: true,
    user_insight: null,
    discovered_in_conversation_id: 'conversation-1',
    strength: 1.0,
    created_at: '2025-08-28T11:30:00Z',
    updated_at: null
  },
  {
    id: 'connection-2',
    user_id: 'user-1',
    source_artifact_id: 'artifact-1', // MOTOMAMI
    target_artifact_id: 'artifact-2', // The Dispossessed
    relationship_type: 'explores_similar_themes',
    description: 'Both challenge established power structures in their respective domains. The album experiments with music industry conventions while the novel explores alternatives to capitalist systems.',
    connection_source: 'ai_suggested',
    user_accepted: null, // Pending review
    user_insight: null,
    discovered_in_conversation_id: 'conversation-1',
    strength: 0.8,
    created_at: '2025-08-28T12:00:00Z',
    updated_at: null
  },
  {
    id: 'connection-3',
    user_id: 'user-1',
    source_artifact_id: 'artifact-3', // Carrier Bag Theory
    target_artifact_id: 'artifact-2', // The Dispossessed
    relationship_type: 'responds_to',
    description: 'Both written by Ursula K. Le Guin, exploring similar themes of alternative narratives and social structures',
    connection_source: 'factual_reference',
    user_accepted: true,
    user_insight: null,
    discovered_in_conversation_id: null,
    strength: 1.0,
    created_at: '2025-08-28T12:15:00Z',
    updated_at: null
  },
  {
    id: 'connection-4',
    user_id: 'user-1',
    source_artifact_id: 'artifact-1', // MOTOMAMI
    target_artifact_id: 'artifact-5', // Everything Everywhere All at Once
    relationship_type: 'uses_similar_technique',
    description: 'Both works employ genre-blending as a core technique, creating something entirely new from existing forms',
    connection_source: 'ai_suggested',
    user_accepted: null, // Pending review
    user_insight: null,
    discovered_in_conversation_id: null,
    strength: 0.75,
    created_at: '2025-08-28T12:30:00Z',
    updated_at: null
  }
];

export const mockConcepts: Concept[] = [
  {
    id: 'concept-1',
    name: 'experimental music',
    type: 'genre',
    description: null,
    is_user_created: false,
    created_by_user: null,
    created_at: '2025-08-28T10:30:00Z',
    updated_at: null
  },
  {
    id: 'concept-2',
    name: 'genre-blending',
    type: 'technique',
    description: null,
    is_user_created: false,
    created_by_user: null,
    created_at: '2025-08-28T10:30:00Z',
    updated_at: null
  },
  {
    id: 'concept-3',
    name: 'anarchism',
    type: 'theme',
    description: null,
    is_user_created: false,
    created_by_user: null,
    created_at: '2025-08-25T14:00:00Z',
    updated_at: null
  },
  {
    id: 'concept-4',
    name: 'challenging conventions',
    type: 'theme',
    description: null,
    is_user_created: true,
    created_by_user: 'user-1',
    created_at: '2025-08-28T11:00:00Z',
    updated_at: null
  },
  {
    id: 'concept-5',
    name: 'cultural identity',
    type: 'theme',
    description: null,
    is_user_created: false,
    created_by_user: null,
    created_at: '2025-08-28T10:30:00Z',
    updated_at: null
  }
];

// Helper to get pending suggestions
export const getPendingSuggestions = () => {
  return mockConnections.filter(c => c.user_accepted === null);
};

// Helper to get artifacts by connection
export const getArtifactById = (id: string) => {
  return mockArtifacts.find(a => a.id === id);
};

// Helper to get connections for an artifact
export const getConnectionsForArtifact = (artifactId: string) => {
  return mockConnections.filter(
    c => c.source_artifact_id === artifactId || c.target_artifact_id === artifactId
  );
};
