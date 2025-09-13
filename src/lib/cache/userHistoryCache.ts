import { supabase } from '@/lib/supabase';

interface CachedUserHistory {
  questionIds: Set<string>;
  lastFetched: number;
  context: string;
}

class UserHistoryCache {
  private cache: Map<string, CachedUserHistory> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  getCacheKey(userId: string, context: string): string {
    return `${userId}_${context}`;
  }
  
  async getQuestionHistory(
    userId: string, 
    context: string
  ): Promise<Set<string>> {
    const cacheKey = this.getCacheKey(userId, context);
    const cached = this.cache.get(cacheKey);
    
    // Return cached if valid
    if (cached && Date.now() - cached.lastFetched < this.CACHE_DURATION) {
      return cached.questionIds;
    }
    
    // Fetch from database
    const { data } = await supabase
      .from('user_question_history')
      .select('question_id')
      .eq('user_id', userId)
      .eq('context', context);
    
    const questionIds = new Set(data?.map(d => d.question_id) || []);
    
    // Update cache
    this.cache.set(cacheKey, {
      questionIds,
      lastFetched: Date.now(),
      context
    });
    
    // Persist to localStorage for cross-session caching
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        `history_${cacheKey}`,
        JSON.stringify(Array.from(questionIds))
      );
    }
    
    return questionIds;
  }
  
  invalidateContext(userId: string, context: string) {
    const cacheKey = this.getCacheKey(userId, context);
    this.cache.delete(cacheKey);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`history_${cacheKey}`);
    }
  }
  
  // Load from localStorage on initialization
  loadFromLocalStorage(userId: string) {
    if (typeof window === 'undefined') return;
    
    const keys = Object.keys(localStorage).filter(k => 
      k.startsWith(`history_${userId}_`)
    );
    
    keys.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        const [, , context] = key.split('_');
        this.cache.set(key.replace('history_', ''), {
          questionIds: new Set(JSON.parse(data)),
          lastFetched: Date.now() - this.CACHE_DURATION + 60000, // Valid for 1 more minute
          context
        });
      }
    });
  }

  // Add question to history
  addToHistory(userId: string, context: string, questionId: string) {
    const cacheKey = this.getCacheKey(userId, context);
    const cached = this.cache.get(cacheKey);
    
    if (cached) {
      cached.questionIds.add(questionId);
      
      // Update localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          `history_${cacheKey}`,
          JSON.stringify(Array.from(cached.questionIds))
        );
      }
    }
  }

  // Clear all cache
  clearAll() {
    this.cache.clear();
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('history_'));
      keys.forEach(key => localStorage.removeItem(key));
    }
  }
}

export const userHistoryCache = new UserHistoryCache();