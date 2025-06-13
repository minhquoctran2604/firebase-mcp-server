# Contributing to Firebase MCP Server

🎉 Thanks for your interest in contributing! This guide will help you get started.

## 🚀 Quick Start

1. **Fork** the repository
2. **Clone** your fork:
   ```bash
   git clone https://github.com/your-username/firebase-mcp-server.git
   cd firebase-mcp-server
   ```
3. **Install** dependencies:
   ```bash
   npm install
   ```
4. **Setup** environment:
   ```bash
   cp .env.example .env
   # Edit .env with your Firebase credentials
   ```

## 🛠️ Development Workflow

### Before Making Changes
1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Test current functionality:
   ```bash
   npm test
   npm run demo
   ```

### Making Changes
1. **Code Style**: Follow existing patterns
2. **Testing**: Add tests for new features
3. **Documentation**: Update README if needed
4. **Commits**: Use clear, descriptive messages

### Testing Your Changes
```bash
npm test          # Test Firebase connection
npm run demo      # Test memory operations
npm start         # Test MCP server startup
```

## 📋 Contribution Types

### 🐛 Bug Reports
- Use the issue template
- Include steps to reproduce
- Provide error messages/logs
- Mention your environment

### ✨ Feature Requests
- Check existing issues first
- Describe the use case
- Explain why it's valuable
- Consider implementation complexity

### 🔧 Code Contributions
- **New Tools**: Add new MCP tools
- **Improvements**: Optimize existing code
- **Documentation**: Improve clarity
- **Tests**: Add missing test coverage

## 🎯 Areas for Contribution

### High Priority
- [ ] Add semantic search capabilities
- [ ] Implement memory categories/namespaces
- [ ] Add memory export/import features
- [ ] Create web dashboard for memory management
- [ ] Add memory analytics and insights

### Medium Priority
- [ ] Support for different storage backends
- [ ] Memory compression/archiving
- [ ] Batch operations for memories
- [ ] Memory templates and schemas
- [ ] Integration with other MCP servers

### Low Priority
- [ ] GUI configuration tool
- [ ] Memory encryption at rest
- [ ] Multi-language support
- [ ] Performance monitoring
- [ ] Memory lifecycle management

## 📝 Code Guidelines

### JavaScript Style
```javascript
// ✅ Good: Clear variable names
const memoryRef = push(ref(database, "memories"));
const memoryData = {
  content,
  metadata: { ...metadata },
  timestamp: Date.now(),
  id: memoryRef.key,
};

// ❌ Bad: Unclear names
const r = push(ref(db, "m"));
const d = { c, m: {...m}, t: Date.now(), i: r.key };
```

### Error Handling
```javascript
// ✅ Good: Proper error handling
try {
  await set(memoryRef, memoryData);
  return { success: true, id: memoryRef.key };
} catch (error) {
  console.error('Error storing memory:', error);
  throw new McpError(
    ErrorCode.InternalError,
    `Failed to store memory: ${error.message}`
  );
}
```

### Documentation
```javascript
/**
 * Store a memory with content and optional metadata
 * @param {string} content - The memory content to store
 * @param {Object} metadata - Optional metadata for the memory
 * @param {string[]} metadata.tags - Tags for categorizing the memory
 * @param {number} metadata.importance - Importance level (1-10)
 * @param {string} metadata.type - Type of memory
 * @returns {Promise<Object>} Response with success status and memory ID
 */
async function storeMemory(content, metadata = {}) {
  // Implementation
}
```

## 🧪 Testing Guidelines

### Unit Tests
- Test individual functions
- Mock Firebase calls
- Cover edge cases
- Test error conditions

### Integration Tests
- Test full MCP workflows
- Use test Firebase project
- Clean up test data
- Test real Firebase operations

### Example Test
```javascript
describe('storeMemory', () => {
  it('should store memory with metadata', async () => {
    const content = "Test memory content";
    const metadata = { tags: ["test"], importance: 5 };
    
    const result = await storeMemory(content, metadata);
    
    expect(result.success).toBe(true);
    expect(result.id).toBeDefined();
  });
});
```

## 📤 Submitting Changes

### Pull Request Checklist
- [ ] Branch is up to date with main
- [ ] All tests pass
- [ ] Code follows style guidelines
- [ ] Documentation is updated
- [ ] Commit messages are clear
- [ ] No credentials in code

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement

## Testing
- [ ] Tests pass locally
- [ ] Manual testing completed
- [ ] New tests added (if applicable)

## Additional Notes
Any additional context or screenshots
```

## 🎯 Getting Help

- **Questions**: Open a GitHub Discussion
- **Bugs**: Create an Issue with details
- **Features**: Propose in Issues first
- **Chat**: Join our community (if available)

## 🏆 Recognition

Contributors will be:
- Listed in README contributors section
- Mentioned in release notes
- Given credit in commit messages
- Invited to maintain the project (for significant contributions)

## 📜 Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help newcomers learn
- Keep discussions relevant
- Follow GitHub's community guidelines

---

**Happy Contributing! 🚀**
