## Generating Microservices with AI Agents

This is an example of a microservice generation task from the study "Can AI Agents Generate Microservices? How Far are We?" The example demonstrates the **Incremental Generation** scenario using the PiggyMetrics `notification-service`.

### Project: PiggyMetrics
PiggyMetrics is a simple financial advisor app built to demonstrate the Microservice Architecture Pattern using Spring Boot, Spring Cloud and Docker. It is decomposed into three core microservices (account-service, statistics-service, notification-service) plus infrastructure services (config, auth, gateway, registry, monitoring).

### Target Microservice: notification-service
Stores user contact information and notification settings (reminders, backup frequency etc). A scheduled worker collects required information from other services and sends e-mail messages to subscribed customers.

---

### Generation Scenarios

**Incremental Generation**: The target microservice's source directory is removed from the codebase, but all integration points, dependencies, configuration, and other services remain intact. The agent can explore the existing architecture to understand patterns, API contracts, and tech stack.

**Clean State Generation**: All implementation traces of the target microservice are removed — directory, configuration files, and API calls from other microservices. The agent must infer architecture and implementation details from requirements specifications alone.

---

### Prompt Strategy P1 (Minimal Context — Service Name Only)

The agent receives only the microservice name and a path to the requirements document (the project README). It must explore the codebase to discover everything else.

```
I need you to generate a complete microservice implementation in one go based on the following:

REQUIREMENTS DOCUMENT: VERY IMPORTANT: Look at README.md for the entire architecture and requirements.

TARGET MICROSERVICE TO GENERATE: notification-service

INSTRUCTIONS:
FIRST: Explore the existing codebase - read through all relevant files to understand:
- What microservices already exist
- Current architecture patterns and tech stack being used
- Existing database schemas, API patterns, and code structure
- How services currently communicate with each other
- What's already implemented vs what's missing
- Analyze the entire requirements document to understand the system context
- Focus specifically on the target microservice description provided above
- Based on your exploration, determine what needs to be built/modified
- Generate a complete microservice that implements ONLY the functionality described
  in the target microservice
- Ensure the microservice integrates properly with existing services and follows
  established patterns
- CODE EVERYTHING IN ONE GO - After exploration, generate all files, components,
  and code at once
- Include all necessary components: API endpoints, data models, business logic,
  error handling, and security considerations

OUTPUT FORMAT: Generate the complete microservice code with all files:
- Main application file
- API endpoints/controllers
- Data models and schemas
- Business logic services
- Database configuration
- Error handling and validation
- Security implementation (authentication, authorization)
- Configuration files (requirements.txt, .env templates, etc.)
- Docker files if applicable
- Documentation/README

CONSTRAINTS:
- FIRST STEP: Explore and read the existing codebase thoroughly before coding
- Use the same tech stack, patterns, and conventions as existing services
- Generate only the specified microservice, not the entire system
- Ensure the service follows existing architecture patterns and integrates seamlessly
- Follow the established microservice patterns already in the codebase
- Include proper logging and monitoring hooks consistent with existing services
- Make the service production-ready and consistent with current deployment patterns
- Provide complete, runnable code that fits the existing ecosystem

IMPORTANT:
- Start by exploring the existing codebase - read files, understand patterns, see
  what's already built
- Then code the entire microservice implementation based on your findings
- Don't ask questions about tech stack - use what's already established in the project
- Follow existing patterns and integrate seamlessly with current architecture
- AFTER you have given code at the very end, try running the system:
  ./run-piggymetrics.sh build to compile the Java services and verify there are no
  compilation errors. Test cases exist in the service directories for reference
  (in src/test/ folders) but DO NOT run them or modify them.
```

---

### Prompt Strategy P2 (With Implementation Summary)

The agent receives the microservice name, requirements path, **and** a pre-generated implementation summary describing the service's functional scope, API responsibilities, integrations, and technical approach.

```
I need you to generate a complete microservice implementation in one go based on the following:

REQUIREMENTS DOCUMENT: VERY IMPORTANT: Look at README.md for the entire architecture and requirements.

TARGET MICROSERVICE TO GENERATE:
MICROSERVICE: notification-service

  FUNCTIONAL SCOPE:
  - Manages user notification preferences and settings for a personal finance application
  - Sends scheduled email notifications to users about their account activity
  - Stores user contact information and notification scheduling configuration

  KEY FEATURES IMPLEMENTED:
  - User notification settings management (active/inactive, frequency configuration)
  - Scheduled email delivery for backup and reminder notifications
  - Account data backup email delivery with JSON attachments
  - Configurable notification frequency (weekly, monthly, quarterly)
  - Asynchronous notification processing with error handling

  API RESPONSIBILITIES:
  - GET /notifications/settings/current - Retrieve current user's notification settings
  - PUT /notifications/settings/current - Save/update current user's notification settings
  - OAuth2 secured endpoints requiring user authentication
  - RESTful API following microservice communication patterns

  DATA RESPONSIBILITIES:
  - Store user recipient data (account name, email, notification preferences)
  - Manage notification settings per notification type (BACKUP, REMIND)
  - Track last notification timestamps to enforce frequency rules
  - Validate email addresses and notification configuration
  - MongoDB document storage with custom frequency enum conversions

  INTEGRATIONS:
  - Consumes account-service via Feign client to retrieve account data for backup emails
  - Integrates with centralized config-service for email templates and SMTP configuration
  - Uses OAuth2 authentication service for request authorization
  - Registers with Eureka service discovery for load balancing
  - Publishes metrics via Hystrix for monitoring dashboard
  - Uses Spring Cloud Bus with AMQP for configuration refresh

  TECHNICAL APPROACH:
  - Spring Boot microservice with Spring Cloud ecosystem integration
  - Scheduled tasks using @Scheduled annotations with configurable cron expressions
  - Asynchronous email processing using CompletableFuture for non-blocking operations
  - MongoDB repository pattern with custom queries for notification readiness
  - RefreshScope configuration for dynamic email template updates without restarts
  - JavaMail integration with SMTP for email delivery

  IMPLEMENTATION NOTES:
  - Two notification types: BACKUP (daily at noon) and REMIND (daily at midnight)
  - Frequency-based notification logic prevents spam by tracking last notification dates
  - Error handling includes logging and graceful failure without blocking other notifications
  - Email templates externalized to config service for easy modification
  - Custom MongoDB converters for Frequency enum persistence
  - Circuit breaker pattern integration for resilient service-to-service communication

INSTRUCTIONS:
[... same as P1 ...]
```

---

### Requirements Document (README.md excerpt)

The requirements document is the project README, which contains the full architecture description:

```
# Piggy Metrics

## Functional services
Piggy Metrics is decomposed into three core microservices. All of them are
independently deployable applications organized around certain business domains.

#### Notification service
Stores user contact information and notification settings (reminders, backup
frequency etc). Scheduled worker collects required information from other
services and sends e-mail messages to subscribed customers.

Method   Path                                 Description                         Auth
------   ------------------------------------  ----------------------------------  ----
GET      /notifications/settings/current      Get current notification settings    x
PUT      /notifications/settings/current      Save current notification settings   x

#### Notes
- Each microservice has its own database (MongoDB)
- All services communicate via REST API
- OAuth2 for authentication, Eureka for service discovery
```

---

### Experiment Workflow

The generation script (`generate_microservices.py`) automates the following per service:
1. **Git Setup**: Checkout to baseline branch (with service code removed), create experiment branch
2. **Prompt Assembly**: Build prompt from service name (P1) or service name + description file (P2)
3. **AI Execution**: Run the agent CLI (e.g., `claude`, `codex exec`, `qwen`) with the prompt in non-interactive mode
4. **Build Verification**: Agent compiles with `./run-piggymetrics.sh build` to verify no errors
5. **Git Commit**: Commit generated code to experiment branch, push, return to main

Each combination (3 agents x 3 services x 2 prompts x 2 scenarios) produces one branch with the generated microservice code.

---

### Evaluation Metrics
Generated microservices are evaluated across three dimensions:
1. **Functional Correctness** — Unit test pass rates (incremental) or integration test pass rates (clean state)
2. **Code Quality** — SLOC, Cyclomatic Complexity, and Cognitive Complexity via SonarQube
3. **Efficiency** — Generation time, monetary cost, and token consumption
