import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import Login from "@/components/Login/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route - redirect to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        {/* Login route */}
        <Route path="/login" element={<Login />} />
        
        {/* Dashboard route - your existing shadcn UI page */}
        <Route 
          path="/dashboard" 
          element={
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
              <Button variant="default">Shadcn UI Working 🚀</Button>
            </div>
          } 
        />
        
        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;