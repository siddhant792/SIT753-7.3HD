const WebSocket = require('ws');
const logger = require('../utils/logger');

class WebSocketService {
  constructor() {
    this.wss = null;
    this.clients = new Map(); 
    this.tenantClients = new Map(); 
  }

  initialize(server) {
    this.wss = new WebSocket.Server({ server });

    this.wss.on('connection', (ws, req) => {
      
      const userId = req.user?.id;
      const tenantId = req.user?.tenantId;

      if (!userId || !tenantId) {
        ws.close(1008, 'Authentication required');
        return;
      }

      
      this.clients.set(userId, ws);

      
      if (!this.tenantClients.has(tenantId)) {
        this.tenantClients.set(tenantId, new Set());
      }
      this.tenantClients.get(tenantId).add(ws);

      
      ws.on('close', () => {
        this.clients.delete(userId);
        this.tenantClients.get(tenantId)?.delete(ws);
        if (this.tenantClients.get(tenantId)?.size === 0) {
          this.tenantClients.delete(tenantId);
        }
      });

      
      ws.on('error', (error) => {
        logger.error('WebSocket error:', error);
      });
    });

    logger.info('WebSocket server initialized');
  }

  emitToUser(userId, event, data) {
    const client = this.clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ event, data }));
    }
  }

  emitToTenant(tenantId, event, data) {
    const clients = this.tenantClients.get(tenantId);
    if (clients) {
      const message = JSON.stringify({ event, data });
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  }

  broadcast(event, data) {
    const message = JSON.stringify({ event, data });
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}

module.exports = new WebSocketService(); 