class Logger {
  constructor() {
    this.logs = [];
    this.listeners = [];
  }

  log(level, category, message, data = null) {
    const logEntry = {
      id: Date.now() + '-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      level,
      category,
      message,
      data
    };
    
    this.logs.push(logEntry);
    
    // Limit logs buffer size
    if (this.logs.length > 150) {
      this.logs.shift();
    }

    // Nice console coloring
    const colors = {
      INFO: '#00e676',
      WARN: '#ffea00',
      ERROR: '#ff1744'
    };
    console.log(
      `%c[${logEntry.timestamp}] [${level}] [${category}] ${message}`,
      `color: ${colors[level] || 'white'}; font-weight: bold; background: #212121; padding: 2px 5px; border-radius: 3px;`,
      data ? JSON.parse(JSON.stringify(data)) : ''
    );

    this.listeners.forEach(listener => listener(logEntry, this.logs));
  }

  info(category, message, data) {
    this.log('INFO', category, message, data);
  }

  warn(category, message, data) {
    this.log('WARN', category, message, data);
  }

  error(category, message, data) {
    this.log('ERROR', category, message, data);
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getLogs() {
    return this.logs;
  }

  clear() {
    this.logs = [];
    this.listeners.forEach(listener => listener(null, this.logs));
  }
}

const logger = new Logger();
export default logger;
