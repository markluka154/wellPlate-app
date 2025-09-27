# NutriAI Worker Service

Python FastAPI service for AI-powered meal plan generation using OpenAI GPT-4.

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Poetry
- OpenAI API key

### Installation
```bash
# Install dependencies
poetry install

# Set up environment variables
cp env.example .env
# Fill in your actual values in .env

# Start development server
poetry run uvicorn worker.main:app --reload --host 0.0.0.0 --port 8420
```

The service will be available at http://localhost:8420

## 🧪 Testing

```bash
# Run tests
poetry run pytest tests/ -v

# Run with coverage
poetry run pytest tests/ --cov=worker --cov-report=html
```

## 🚀 Deployment

### Docker
```bash
# Build image
docker build -t nutriai-worker .

# Run container
docker run -p 8420:8420 --env-file .env nutriai-worker
```

### Render
1. Connect your GitHub repository to Render
2. Use the included `render.yaml` configuration
3. Set environment variables in Render dashboard

### Fly.io
```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Deploy
fly deploy
```

## 📋 Environment Variables

Required environment variables:

```bash
# OpenAI API Key
OPENAI_API_KEY=sk-your-openai-api-key

# CORS Settings
ALLOWED_ORIGINS=http://localhost:4321,https://your-domain.com

# Server Configuration
PORT=8420
```

## 🏗️ Project Structure

```
worker/
├── main.py                    # FastAPI application
├── routers/                   # API route handlers
│   ├── health.py             # Health check endpoints
│   └── generate.py           # Meal plan generation
├── services/                 # Business logic
│   └── openai_client.py      # OpenAI integration
├── schemas.py                # Pydantic models
└── config.py                 # Configuration settings

tests/
└── test_generate.py          # Test cases
```

## 🔧 Available Scripts

```bash
poetry run uvicorn worker.main:app --reload --port 8420  # Start dev server
poetry run pytest tests/ -v                              # Run tests
poetry run mypy worker/                                   # Type checking
poetry run flake8 worker/                                 # Linting
```

## 🤖 AI Integration

The service uses OpenAI GPT-4 to generate personalized meal plans:

### Features
- **Structured JSON output** with function calling
- **Nutritional accuracy** with macro calculations
- **Diet adherence** (vegan, keto, etc.)
- **Allergy avoidance** with ingredient filtering
- **Calorie targeting** with ±10% tolerance
- **Retry logic** for invalid responses

### Prompt Engineering
- **Detailed user preferences** including age, weight, height, goals
- **Dietary restrictions** and cooking preferences
- **Nutritional requirements** with macro targets
- **Structured output format** for consistent parsing

## 📊 API Endpoints

### Health Check
- `GET /health` - Basic health check
- `GET /health/ready` - Readiness check for orchestration

### Meal Plan Generation
- `POST /generate` - Generate personalized meal plan

#### Request Format
```json
{
  "preferences": {
    "age": 30,
    "weightKg": 70.0,
    "heightCm": 170,
    "sex": "male",
    "goal": "maintain",
    "dietType": "omnivore",
    "allergies": ["nuts"],
    "dislikes": ["mushrooms"],
    "cookingEffort": "quick",
    "caloriesTarget": 2000
  }
}
```

#### Response Format
```json
{
  "plan": [
    {
      "day": 1,
      "meals": [
        {
          "name": "Greek Yogurt Parfait",
          "kcal": 420,
          "protein_g": 28.0,
          "carbs_g": 45.0,
          "fat_g": 14.0,
          "ingredients": [
            {"item": "Greek yogurt", "qty": "200g"},
            {"item": "Berries", "qty": "100g"}
          ],
          "steps": ["Mix ingredients", "Serve"]
        }
      ]
    }
  ],
  "totals": {
    "kcal": 2000,
    "protein_g": 130.0,
    "carbs_g": 200.0,
    "fat_g": 70.0
  },
  "groceries": [
    {"category": "Dairy", "items": ["Greek yogurt (1kg)"]},
    {"category": "Produce", "items": ["Berries (700g)"]}
  ]
}
```

## 🔒 Security

- **CORS protection** with allowed origins
- **Input validation** with Pydantic schemas
- **Rate limiting** (can be added)
- **API key security** with environment variables
- **Error handling** without exposing internals

## 🧪 Testing Strategy

- **Unit tests** for schema validation
- **Integration tests** for OpenAI client
- **Mock testing** for external API calls
- **Error handling tests** for edge cases
- **Performance tests** for response times

## 🚀 Performance

- **Async/await** for non-blocking operations
- **Connection pooling** for OpenAI API
- **Response caching** (can be implemented)
- **Request timeout** handling
- **Memory optimization** with proper cleanup

## 🔄 Error Handling

- **Validation errors** with detailed messages
- **OpenAI API errors** with retry logic
- **Network timeouts** with proper handling
- **Invalid responses** with self-healing retries
- **Logging** for debugging and monitoring

## 📊 Monitoring

- **Health check endpoints** for load balancers
- **Structured logging** for observability
- **Performance metrics** (can be added)
- **Error tracking** with proper logging
- **Request/response logging** for debugging

## 🐛 Debugging

- **Structured logging** with different levels
- **Request/response logging** for API calls
- **Error context** with stack traces
- **Environment validation** on startup
- **Debug mode** with verbose logging

## 🔧 Configuration

The service uses Pydantic Settings for configuration:

```python
class Settings(BaseSettings):
    OPENAI_API_KEY: str
    ALLOWED_ORIGINS: List[str] = ["http://localhost:4321"]
    PORT: int = 8420
    
    class Config:
        env_file = ".env"
```

## 🌐 CORS Configuration

CORS is configured to allow requests from the web application:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 📈 Scalability

- **Stateless design** for horizontal scaling
- **Async operations** for high concurrency
- **Connection pooling** for efficiency
- **Load balancer ready** with health checks
- **Container ready** with Docker support

## 🔄 Development Workflow

1. **Make changes** to the code
2. **Run tests** to ensure functionality
3. **Test locally** with the web app
4. **Deploy** to staging environment
5. **Test integration** with web app
6. **Deploy** to production

## 🆘 Troubleshooting

### Common Issues

1. **OpenAI API errors**: Check API key and rate limits
2. **CORS errors**: Verify ALLOWED_ORIGINS configuration
3. **Validation errors**: Check request format
4. **Timeout errors**: Increase timeout settings
5. **Memory issues**: Monitor resource usage

### Debug Mode

```bash
# Enable debug logging
export LOG_LEVEL=DEBUG
poetry run uvicorn worker.main:app --reload --port 8420
```

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Pydantic Documentation](https://pydantic-docs.helpmanual.io/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Poetry Documentation](https://python-poetry.org/docs/)
- [Docker Documentation](https://docs.docker.com/)

## 🎯 Key Features

1. **AI-Powered Generation**: GPT-4 for intelligent meal planning
2. **Structured Output**: Consistent JSON format for easy parsing
3. **Nutritional Accuracy**: Precise macro and calorie calculations
4. **Diet Adherence**: Strict compliance with dietary restrictions
5. **Allergy Safety**: Complete allergen avoidance
6. **Retry Logic**: Self-healing for invalid responses
7. **High Performance**: Async operations for scalability
8. **Production Ready**: Comprehensive error handling and monitoring
