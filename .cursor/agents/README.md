---
name: README
model: fast
---

# Cursor Subagents

This directory contains specialized AI subagents for software development. Each agent is an expert in their domain and can be invoked to assist with specific tasks.

## Available Agents

### 1. **Verifier Agent** (`verifier.md`)
**Role**: Quality Assurance & Validation

Validates completed work, runs tests, checks implementations are functional, and provides comprehensive pass/fail reports. Use when you need:
- Code validation and verification
- Test execution and reporting
- Requirements checking
- Quality assurance before deployment

---

### 2. **Node.js Master** (`nodejs-master.md`)
**Role**: Backend Architecture & Node.js Specialist

Expert in Node.js, backend development, API design, and server-side optimization. Use when you need:
- RESTful or GraphQL API development
- Database integration and optimization
- Authentication and security implementation
- Performance optimization and scaling
- Express, Fastify, NestJS, or other Node frameworks

---

### 3. **Senior React Developer** (`react-senior.md`)
**Role**: Frontend Architecture & React Specialist

Expert in React.js, modern frontend patterns, state management, and UI/UX. Use when you need:
- React component architecture
- State management (Redux, Zustand, Context)
- Performance optimization (memoization, lazy loading)
- UI libraries integration (Tailwind, Material-UI, shadcn/ui)
- Hooks and modern React patterns
- Testing with React Testing Library

---

### 4. **TypeScript Specialist** (`typescript-specialist.md`)
**Role**: Type System Architecture & TypeScript Expert

Expert in TypeScript, advanced typing patterns, and type-safe architecture. Use when you need:
- Complex type definitions and generics
- Type-safe API contracts
- TypeScript configuration optimization
- Migration from JavaScript to TypeScript
- Advanced typing patterns (branded types, discriminated unions)
- Type guards and narrowing

---

### 5. **Quality Assurance Analyst** (`qa-analyst.md`)
**Role**: Testing & Quality Assurance Specialist

Expert in testing methodologies, test automation, and QA processes. Use when you need:
- Test strategy and planning
- Unit, integration, and E2E testing
- Test automation frameworks (Jest, Playwright, Cypress)
- Test coverage analysis
- CI/CD test integration
- Bug reporting and tracking

---

### 6. **Technical Project Manager** (`project-manager.md`)
**Role**: Project Management & Delivery Lead

Expert in agile methodologies, project planning, and team coordination. Use when you need:
- Sprint planning and estimation
- User story creation and breakdown
- Risk management and mitigation
- Stakeholder communication
- Project tracking and reporting
- Retrospectives and process improvement

---

### 7. **Software Architect** (`software-architect.md`)
**Role**: System Architecture & Technical Strategy

Expert in system design, architectural patterns, and scalability. Use when you need:
- High-level system architecture
- Technology selection and evaluation
- Scalability and performance planning
- Database schema design
- API contract design
- Architecture Decision Records (ADRs)

---

### 8. **Principal Engineer** (`principal-engineer.md`)
**Role**: Technical Leadership & Engineering Excellence

Senior technical leader combining deep expertise and strategic thinking. Use when you need:
- Technical strategy and roadmap
- Cross-functional technical initiatives
- Build vs buy decisions
- Engineering culture and best practices
- Mentorship and knowledge sharing
- Long-term technical planning

---

### 9. **DevOps/SRE Engineer** (`devops-sre.md`)
**Role**: Infrastructure & Operations Excellence

Expert in CI/CD, infrastructure automation, monitoring, and SRE. Use when you need:
- CI/CD pipeline setup (GitHub Actions, GitLab CI)
- Infrastructure as Code (Terraform, CloudFormation)
- Container orchestration (Docker, Kubernetes)
- Monitoring and observability
- Cloud platform configuration (AWS, GCP, Azure)
- Incident response and on-call procedures

---

### 10. **Security Engineer** (`security-engineer.md`)
**Role**: Security & Compliance Specialist

Expert in application security, threat modeling, and compliance. Use when you need:
- Security architecture and threat modeling
- OWASP Top 10 vulnerability mitigation
- Authentication and authorization implementation
- Security testing (SAST, DAST, penetration testing)
- Compliance (SOC 2, PCI-DSS, GDPR, HIPAA)
- Incident response and security monitoring

---

## How to Use Subagents

### In Cursor

1. **Reference in prompts**: Mention the agent by name or role
   ```
   @nodejs-master Please help me design a scalable API architecture
   ```

2. **Consult for expertise**: Ask specific questions
   ```
   @security-engineer How should I implement JWT authentication securely?
   ```

3. **Request reviews**: Ask agents to review work
   ```
   @verifier Please validate this implementation and run all tests
   ```

4. **Collaborative work**: Combine multiple agents
   ```
   @software-architect design the system
   @nodejs-master implement the backend
   @react-senior build the frontend
   @qa-analyst create the test suite
   @verifier validate everything
   ```

### Best Practices

- **Be specific**: Clearly state what you need from each agent
- **Use the right agent**: Match the task to the agent's expertise
- **Provide context**: Share relevant code, requirements, and constraints
- **Sequential workflow**: Use agents in logical order (design → implement → test → verify)
- **Collaborative approach**: Different agents can work together on complex projects

## Agent Capabilities Matrix

| Agent | Code Writing | Architecture | Testing | Security | DevOps | Management |
|-------|-------------|--------------|---------|----------|--------|------------|
| Verifier | ⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐ |
| Node.js Master | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐ |
| React Senior | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐ | ⭐ | ⭐ |
| TypeScript | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐ | ⭐ | ⭐ |
| QA Analyst | ⭐⭐ | ⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐ |
| Project Manager | ⭐ | ⭐⭐ | ⭐ | ⭐ | ⭐ | ⭐⭐⭐ |
| Architect | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ |
| Principal | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| DevOps/SRE | ⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐ |
| Security | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐ |

⭐⭐⭐ = Primary Expertise | ⭐⭐ = Strong Knowledge | ⭐ = Basic Understanding

## Example Workflows

### Building a New Feature
```
1. @project-manager - Create user stories and acceptance criteria
2. @software-architect - Design system architecture
3. @nodejs-master - Implement backend API
4. @react-senior - Build frontend components
5. @typescript-specialist - Ensure type safety
6. @qa-analyst - Create test suite
7. @security-engineer - Security review
8. @devops-sre - Set up deployment pipeline
9. @verifier - Final validation
```

### Debugging Production Issue
```
1. @devops-sre - Check logs and metrics
2. @principal-engineer - Investigate root cause
3. @nodejs-master or @react-senior - Fix the issue
4. @security-engineer - Assess security impact
5. @qa-analyst - Add regression tests
6. @verifier - Validate fix
7. @project-manager - Update stakeholders
```

### Code Review
```
1. @typescript-specialist - Review type safety
2. @security-engineer - Check for vulnerabilities
3. @qa-analyst - Verify test coverage
4. @nodejs-master or @react-senior - Review code quality
5. @verifier - Run all checks
```

## Customization

Each agent file can be customized to match your team's:
- Coding standards and conventions
- Technology stack preferences
- Security requirements
- Testing strategies
- Deployment processes

Edit the `.md` files to add company-specific guidelines, tools, or processes.

## Contributing

To add a new agent:

1. Create a new `.md` file in this directory
2. Add YAML frontmatter with `name`, `description`, and `role`
3. Define the agent's expertise and responsibilities
4. Include code examples and best practices
5. Update this README with the new agent

---

**Need help?** Start with the **@verifier** agent to check your current setup, or the **@project-manager** to plan your next steps!
