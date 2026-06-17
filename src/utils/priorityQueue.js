// Priority weights definition
export const PRIORITY_WEIGHTS = {
  Placement: 3,
  Result: 2,
  Event: 1
};

/**
 * PriorityInbox class maintains the top N (default 10) unread notifications.
 * It uses a score calculated from the type weight and the creation time.
 */
export class PriorityInbox {
  constructor(limit = 10) {
    this.limit = limit;
    this.items = [];
  }

  // Calculate composite score: type priority dominates, secondary ordering by timestamp
  getScore(notification) {
    const typeWeight = PRIORITY_WEIGHTS[notification.type] || 0;
    const timeFactor = new Date(notification.createdAt).getTime() / 1e12; // Normalized timestamp
    // Formula: (Weight * 10) + timeFactor ensures higher weight always wins over lower,
    // and newer items win within the same weight class.
    return typeWeight * 100 + timeFactor;
  }

  // Adds a list of notifications and returns the top N unread
  process(notifications) {
    // Filter out read notifications
    const unread = notifications.filter(n => !n.isRead);
    
    // Map with scores
    const scored = unread.map(n => ({
      ...n,
      score: this.getScore(n)
    }));
    
    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);
    
    // Return top N
    return scored.slice(0, this.limit).map(({ score, ...rest }) => rest);
  }
}
