// Application entry point

import { createApp } from './app.js';

const PORT = parseInt(process.env.PORT ?? '3000', 10);

const app = createApp();

app.listen(PORT, () => {
  console.log(`TaskFlow API running on http://localhost:${PORT}`);
});
