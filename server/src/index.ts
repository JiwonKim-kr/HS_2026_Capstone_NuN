import 'dotenv/config'; // 환경변수 최우선 로딩
import express from 'express';
import cors from 'cors';
import promptRoutes from './routes/promptRoutes';

const app = express();
const PORT = process.env.PORT || 8080;

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// 라우터 설정 (기획안 내 명세된 기본 엔드포인트 /api/prompts)
app.use('/api/prompts', promptRoutes);

// 서버 확인용 헬스체크 라우트
app.get('/', (req, res) => {
  res.send('Prompt-U API Server is running.');
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
