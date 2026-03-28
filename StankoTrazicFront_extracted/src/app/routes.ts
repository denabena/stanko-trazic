import { createBrowserRouter } from 'react-router';
import { MarketingPage } from './components/marketing-page';
import { QuizFlow } from './components/quiz-flow';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: MarketingPage,
  },
  {
    path: '/quiz',
    Component: QuizFlow,
  },
]);
