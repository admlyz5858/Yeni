import express from 'express';
import cors from 'cors';
import notebookRoutes from './routes/notebook.routes';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/notebook', notebookRoutes);

app.get('/health', (_, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
