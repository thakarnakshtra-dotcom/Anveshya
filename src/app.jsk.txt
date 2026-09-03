import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Experiment } from './pages/Experiment';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/experiment" element={<Experiment />} />
        {/* Rest of routes unchanged */}
      </Routes>
    </BrowserRouter>
  );
}