import express from 'express';
import path from 'path';
import cors from 'cors';
import router from './routes/index.js';

const app = express();

const corsOptions: cors.CorsOptions = {
  origin: 'http://localhost:5173',
};

app.use(cors(corsOptions));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use('/api', router);

const PORT = Number(process.env.PORT) || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});