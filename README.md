# Sistema de Controle de Estoque

Aplicação full stack para cadastrar **produtos** e **matérias-primas**, montar a **composição** de cada produto e calcular **quanto dá para produzir** com o estoque atual, priorizando os produtos de maior valor.

## Funcionalidades

- CRUD de produtos (código, nome, preço) e de matérias-primas (código, nome, estoque)
- Associação de matérias-primas a produtos, com a quantidade necessária por unidade
- Sugestão de produção com base no estoque, indicando a matéria-prima que limita cada produto (o "gargalo")
- Validações (campos obrigatórios, códigos únicos) e mensagens de erro claras na interface
- Bloqueio da exclusão de matéria-prima que está em uso por algum produto
- API documentada com OpenAPI/Swagger
- Testes automatizados (regra de negócio no backend e telas no frontend) e pipeline de CI no GitHub Actions
- Tudo sobe com um único comando via Docker Compose

## Tecnologias

| Camada | Tecnologia |
|--------|------------|
| Backend | Java 21, Quarkus 3 (REST, Hibernate ORM com Panache, Bean Validation) |
| Banco de dados | MySQL 8 |
| Frontend | React 18, Redux Toolkit, Vite |
| Documentação da API | OpenAPI / Swagger UI |
| Testes | JUnit 5 (backend), Vitest + Testing Library (frontend) |
| Infra | Docker, Docker Compose, GitHub Actions |

## Como executar

### Com Docker (recomendado)

Requisitos: Docker e Docker Compose.

```bash
docker compose up --build
```

| Serviço | URL |
|---------|-----|
| Aplicação (frontend) | http://localhost:3000 |
| API | http://localhost:8080/api |
| Swagger UI | http://localhost:8080/q/swagger-ui |

Na primeira execução o banco recebe dados de exemplo (uma marcenaria). Para desativar, defina `SEED_DEMO_DATA=false` no serviço `backend`.

### Em modo de desenvolvimento

Requisitos: Java 21, Maven 3.9+, Node 22+ e Docker (só para o MySQL).

```bash
# 1) Banco
docker compose up mysql

# 2) Backend (porta 8080) — o MySQL do compose fica na porta 3307 do host
cd backend
DB_URL="jdbc:mysql://localhost:3307/inventorydb?useSSL=false&allowPublicKeyRetrieval=true" mvn quarkus:dev

# 3) Frontend (porta 5173, com proxy de /api para o backend)
cd frontend
npm install
npm run dev
```

### Testes

```bash
cd backend && mvn test
cd frontend && npm test
```

## Regra de negócio: sugestão de produção

A rota `GET /api/production` funciona assim:

1. Ordena os produtos pelo **maior preço unitário** (empate: pelo código).
2. Para cada produto, calcula quantas unidades cabem no estoque **que ainda está disponível**: para cada matéria-prima, `estoque disponível ÷ quantidade necessária` (divisão inteira); vale o menor resultado.
3. Desconta do estoque o que foi consumido, de modo que uma matéria-prima compartilhada por vários produtos **nunca é contada duas vezes**.
4. Devolve a quantidade, o valor total (`preço × quantidade`) e a matéria-prima limitante de cada produto, além do valor total geral.

> **Limitação conhecida:** é uma estratégia gulosa (prioriza por preço unitário). Ela é simples, previsível e fácil de explicar, mas não garante o máximo global de receita — isso seria um problema de otimização inteira (programação linear inteira).

O código está em [`ProductionCalculator`](backend/src/main/java/com/inventory/service/ProductionCalculator.java), uma classe Java pura, sem dependência de framework, coberta por testes unitários.

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET / POST | `/api/products` | Lista / cria produtos |
| GET / PUT / DELETE | `/api/products/{id}` | Busca / atualiza / exclui um produto |
| GET / POST | `/api/raw-materials` | Lista / cria matérias-primas |
| GET / PUT / DELETE | `/api/raw-materials/{id}` | Busca / atualiza / exclui uma matéria-prima |
| GET | `/api/production` | Sugestão de produção |

Exemplo de corpo para criar um produto:

```json
{
  "code": "PR-010",
  "name": "Mesa de centro",
  "price": 320.00,
  "materials": [
    { "rawMaterialId": 1, "quantityRequired": 3 },
    { "rawMaterialId": 2, "quantityRequired": 12 }
  ]
}
```

## Estrutura

```
.
├── backend/                  # API Quarkus
│   └── src/main/java/com/inventory/
│       ├── entity/           # Product, RawMaterial, ProductRawMaterial
│       ├── dto/              # Requests (com validação) e responses
│       ├── resource/         # Endpoints REST
│       ├── service/          # ProductionCalculator (regra de negócio)
│       ├── exception/        # Erros de negócio -> resposta JSON
│       └── config/           # Carga de dados de demonstração
├── frontend/                 # React + Redux
│   └── src/{pages,components,redux}
├── docker-compose.yml
└── .github/workflows/ci.yml
```

## Próximos passos

- Autenticação e perfis de acesso
- Migrações com Flyway em vez de `hibernate-orm.database.generation=update`
- Paginação e busca nas listagens
- Testes de integração da API com banco em memória
- Movimentação de estoque (entradas/saídas) com histórico
