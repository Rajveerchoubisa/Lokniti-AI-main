
import './App.css'
import { BrowserRouter as Router,Routes,Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Login from "./pages/Login"
import Home from './pages/Home'
import SignUp from './pages/SignUp'
import VerifyOTP from './components/verify-otp.jsx'

function App() {

  return ( 
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/Dashboard' element={<Dashboard />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<SignUp />} />
        <Route path='/verify-otp' element={<VerifyOTP />} />
      </Routes>
    </Router>
  )
}

export default App
