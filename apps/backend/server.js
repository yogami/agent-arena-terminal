const path = require('path');
const next = require('next');
const app = require('./app');

const PORT = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== 'production';

// Initialize Next.js app from the apps/frontend directory
const frontendDir = path.join(__dirname, '../frontend');
const nextApp = next({ dev, dir: frontendDir });
const handle = nextApp.getRequestHandler();

nextApp
  .prepare()
  .then(() => {
    // All Express API routes (/api/*, /a2a/*, /health) are already bound in ./app

    // Catch-all route for Next.js to handle the frontend UI
    app.use((req, res) => {
      return handle(req, res);
    });

    app.listen(PORT, () => {
      console.log(`Agent Arena Terminal full-stack server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error starting Next.js:', err);
    process.exit(1);
  });
