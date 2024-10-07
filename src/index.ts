import express from 'express';
import cors from 'cors';
import userRouter from './routes/userRouter';
// import path from 'path';

const app = express();

app.use(cors());
app.use(express.json());
// app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 


app.use('/api/v1/user', userRouter);

app.listen(3000, () => console.log('server currently running on 3000'));