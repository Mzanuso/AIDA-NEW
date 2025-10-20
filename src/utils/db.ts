// Mock database - in-memory storage for development
// TODO: Replace with real Supabase/PostgreSQL connection

interface Session {
  id: string;
  userId: string;
  projectId?: string;
  createdAt: Date;
  updatedAt: Date;
  data: any;
}

const sessions = new Map<string, Session>();

export const db = {
  async query(sql: string, params?: any[]) {
    // Mock implementation - always returns empty result
    return { rows: [] };
  },

  async getSession(sessionId: string): Promise<Session | null> {
    return sessions.get(sessionId) || null;
  },

  async createSession(userId: string, projectId?: string): Promise<Session> {
    const session: Session = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      projectId,
      createdAt: new Date(),
      updatedAt: new Date(),
      data: {}
    };
    sessions.set(session.id, session);
    return session;
  },

  async updateSession(sessionId: string, data: any): Promise<void> {
    const session = sessions.get(sessionId);
    if (session) {
      session.data = { ...session.data, ...data };
      session.updatedAt = new Date();
    }
  },

  async deleteSession(sessionId: string): Promise<void> {
    sessions.delete(sessionId);
  }
};

export default db;
