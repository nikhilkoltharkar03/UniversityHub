---
name: graphify
description: Codebase structural mapper and architecture graph generator using local AST parsing.
---

# Graphify Code Intelligence & Architecture Mapping

Build queryable structural knowledge graphs and relationship maps of codebases without heavy vector databases.

## Capabilities
1. **Structural Dependency Mapping**:
   - Trace imports, module exports, route handlers, and service dependencies.
   - Map relationships between Client components, API endpoints, MongoDB models, and background workers.

2. **AST-Based Analysis**:
   - Parse syntax trees to identify key architectural hubs ("god nodes" or central models like `Project.js`).
   - Pinpoint circular dependencies or unhandled async rejections.

3. **Visual Architecture Documentation**:
   - Generate Mermaid.js diagrams reflecting actual code relationships.

