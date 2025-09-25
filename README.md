# 🧪 Testious

Simple testing framework designed to help developers write, organize, and run tests effortlessly with a clean and expressive API.

---

### 🌟 Features

- **Lightweight & Fast**: Minimal dependencies, optimized for performance

- **Flexible Test Structure**: Supports describe and it blocks for organized testing

- **Asynchronous Support**: Write async tests with ease using promises or async/await

- **Rich Assertions**: Includes built-in expect function with common matcher methods

- **Detailed Reporting**: Clear test results with pass/fail status and error messages

- **Extensible**: Easily extend or customize to fit your project needs

---

### 📦 Installation

Install via npm:

```bash
npm install testious testious-cli testious-node-runner
```

---

### 🚀 Quick Start

#### Init test

```bash
mkdir test && cd test
tesious init
```

#### Create test entrypoint

Create a `node/index.node.test.js` file and add it to the `testious.config.json` file

```json
{
  "node": "*.node.test.js",
  "browser": "*.browser.test.js"
}
```

Edit in `node/index.node.test.js`:

```javascript
import { test, expect } from 'testious';

test('Array utilities', (g) => {
  g.it('should correctly find the length of an array', () => {
    const arr = [1, 2, 3];
    expect(arr.length).toBe(3);
  });

  g.it('should support async operations', async () => {
    const fetchData = () => Promise.resolve('data');
    const data = await fetchData();
    expect(data).toBe('data');
  });
});
```

Finally, run test by command

```bash
testious run --node
```

---

### 💡 Best Practices

- Use descriptive test names to make your test output more readable.
- Keep tests small and focused on one behavior.
- Use async tests when working with promises or async functions.
- Structure tests into meaningful suites with describe.

---

### 🤝 Contributing

Contributions are warmly welcome! Feel free to open issues or submit pull requests at:
https://github.com/smtdfc/testious

Please follow the Contributor Covenant Code of Conduct to keep the community positive and respectful.

---

### 📄 License

MIT License © smtdfc
