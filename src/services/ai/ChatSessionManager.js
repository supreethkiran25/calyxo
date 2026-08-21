/**
 * Calyxo Persistent Chat Session Manager
 *
 * Handles user chat lifecycle:
 * - Creation, Renaming, Pinned status, Archival, Search.
 * - True hard deletion across in-memory state and localStorage.
 * - Separation between System Intelligence Briefings and User Conversations.
 */

const STORAGE_KEY = 'calyxo_ai_sessions_v2';
const ACTIVE_SESSION_KEY = 'calyxo_ai_active_session_id_v2';

export class ChatSessionManager {
  constructor() {
    this.sessions = [];
    this.activeSessionId = null;
    this.restoreLocal();
  }

  restoreLocal() {
    if (typeof localStorage !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          this.sessions = JSON.parse(saved);
        } else {
          this.sessions = [];
        }
        this.activeSessionId = localStorage.getItem(ACTIVE_SESSION_KEY) || (this.sessions[0]?.id || null);
      } catch (e) {
        this.sessions = [];
      }
    }
  }

  persistLocal() {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.sessions));
        if (this.activeSessionId) {
          localStorage.setItem(ACTIVE_SESSION_KEY, this.activeSessionId);
        } else {
          localStorage.removeItem(ACTIVE_SESSION_KEY);
        }
      } catch (e) {}
    }
  }

  /**
   * Create a new user-owned chat session
   */
  createSession({ title = 'New Conversation', role = 'USER', initialMessage = null } = {}) {
    const newSession = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title,
      role,
      isSystemBriefing: false,
      isPinned: false,
      isArchived: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: initialMessage ? [initialMessage] : [
        {
          id: `msg_welcome_${Date.now()}`,
          role: 'assistant',
          text: "Yo! I'm Calyxo, your health & training intelligence layer. Ask me anything about your recovery, customized workout programming, nutrition targets, or biometrics!",
          timestamp: Date.now()
        }
      ]
    };

    this.sessions.unshift(newSession);
    this.activeSessionId = newSession.id;
    this.persistLocal();
    return newSession;
  }

  /**
   * Get active session
   */
  getActiveSession() {
    if (!this.activeSessionId && this.sessions.length > 0) {
      this.activeSessionId = this.sessions[0].id;
    }
    return this.sessions.find(s => s.id === this.activeSessionId) || null;
  }

  /**
   * Set active session
   */
  setActiveSession(sessionId) {
    const exists = this.sessions.some(s => s.id === sessionId);
    if (exists) {
      this.activeSessionId = sessionId;
      this.persistLocal();
      return true;
    }
    return false;
  }

  /**
   * Append message to active or specified session
   */
  appendMessage(message, sessionId = null) {
    const targetId = sessionId || this.activeSessionId;
    const session = this.sessions.find(s => s.id === targetId);
    if (!session) return null;

    const enrichedMsg = {
      id: message.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      role: message.role || 'user',
      text: message.text || '',
      plan: message.plan || null,
      sourceProvenance: message.sourceProvenance || null,
      timestamp: message.timestamp || Date.now(),
      feedback: message.feedback || null // 'up' | 'down' | null
    };

    session.messages.push(enrichedMsg);
    session.updatedAt = Date.now();

    // Auto-update default title from first user query
    if (session.title === 'New Conversation' && enrichedMsg.role === 'user') {
      session.title = enrichedMsg.text.length > 32 ? `${enrichedMsg.text.substring(0, 30)}...` : enrichedMsg.text;
    }

    this.persistLocal();
    return enrichedMsg;
  }

  /**
   * Rename a chat session
   */
  renameSession(sessionId, newTitle) {
    const session = this.sessions.find(s => s.id === sessionId);
    if (session && newTitle && newTitle.trim()) {
      session.title = newTitle.trim();
      session.updatedAt = Date.now();
      this.persistLocal();
      return true;
    }
    return false;
  }

  /**
   * Pin or Unpin a chat session
   */
  togglePin(sessionId) {
    const session = this.sessions.find(s => s.id === sessionId);
    if (session) {
      session.isPinned = !session.isPinned;
      session.updatedAt = Date.now();
      this.persistLocal();
      return session.isPinned;
    }
    return false;
  }

  /**
   * Archive or Unarchive a chat session
   */
  toggleArchive(sessionId) {
    const session = this.sessions.find(s => s.id === sessionId);
    if (session) {
      session.isArchived = !session.isArchived;
      session.updatedAt = Date.now();
      this.persistLocal();
      return session.isArchived;
    }
    return false;
  }

  /**
   * Hard Delete a single chat session
   */
  deleteSession(sessionId) {
    const prevLength = this.sessions.length;
    this.sessions = this.sessions.filter(s => s.id !== sessionId);

    if (this.activeSessionId === sessionId) {
      this.activeSessionId = this.sessions[0]?.id || null;
    }

    this.persistLocal();
    return this.sessions.length < prevLength;
  }

  /**
   * Hard Delete multiple chat sessions
   */
  deleteMultipleSessions(sessionIds = []) {
    const idSet = new Set(sessionIds);
    this.sessions = this.sessions.filter(s => !idSet.has(s.id));

    if (idSet.has(this.activeSessionId)) {
      this.activeSessionId = this.sessions[0]?.id || null;
    }

    this.persistLocal();
    return true;
  }

  /**
   * Clear all messages in a session except welcome message
   */
  clearConversation(sessionId) {
    const session = this.sessions.find(s => s.id === sessionId);
    if (session) {
      session.messages = [
        {
          id: `msg_cleared_${Date.now()}`,
          role: 'assistant',
          text: "Conversation history cleared. How can I help you today?",
          timestamp: Date.now()
        }
      ];
      session.updatedAt = Date.now();
      this.persistLocal();
      return true;
    }
    return false;
  }

  /**
   * Search conversations by title or message content
   */
  searchSessions(query = '') {
    if (!query || !query.trim()) return this.sessions;
    const lower = query.toLowerCase().trim();

    return this.sessions.filter(s => {
      if (s.title.toLowerCase().includes(lower)) return true;
      return s.messages.some(m => m.text && m.text.toLowerCase().includes(lower));
    });
  }

  /**
   * Get all active (unarchived) sessions sorted with pinned first
   */
  getActiveSessionsList() {
    return [...this.sessions]
      .filter(s => !s.isArchived)
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.updatedAt - a.updatedAt;
      });
  }

  /**
   * Delete an individual message from a chat session
   */
  deleteMessage(sessionId, messageId) {
    const session = this.sessions.find(s => s.id === sessionId);
    if (session) {
      const initialCount = session.messages.length;
      session.messages = session.messages.filter(m => m.id !== messageId);
      session.updatedAt = Date.now();
      this.persistLocal();
      return session.messages.length < initialCount;
    }
    return false;
  }

  /**
   * Record User Feedback (Thumbs Up / Down) on specific message
   */
  setMessageFeedback(sessionId, messageId, feedback) {
    const session = this.sessions.find(s => s.id === sessionId);
    if (session) {
      const msg = session.messages.find(m => m.id === messageId);
      if (msg) {
        msg.feedback = feedback; // 'up' | 'down'
        this.persistLocal();
        return true;
      }
    }
    return false;
  }
}

export const chatSessionManager = new ChatSessionManager();
export default chatSessionManager;
