- Advanced search with full-text (PostgreSQL GIN)>
- Repository + Unit of Work patterns
- Docker Compose one-command deployment

## Quick Start
```bash
docker compose up --build -d
curl http://localhost:3000/health
curl -X POST http://localhost:3000/api/products -H "Content-Type: application/json" -d "{\"name\":\"iPhone\",\"price\":999,\"sku\":\"IPH001\"}"
```
