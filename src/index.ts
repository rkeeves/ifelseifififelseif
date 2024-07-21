import app from './app';

const port = process.env['CRUD_PORT'] ?? 3000;

app({ seq: 1, docs: [] }).listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
