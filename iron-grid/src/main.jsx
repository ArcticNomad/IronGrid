
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter,RouterProvider } from 'react-router-dom'
import Registration from './pages/Registration.jsx'
import LoginPage from './pages/Login.jsx'
import MemberRegistration from './pages/MemberRegister.jsx'
import './index.css'
import App from './App.jsx'

const router =createBrowserRouter([
  {
    path:'/',
    element : <App/>
  },
  {
    path:'/register',
    element : <Registration/>
  },
  {
    path:'/login',
    element:<LoginPage/>
  },
   {
    path:'/MemberRegistration',
    element : <MemberRegistration/>
  },

])

createRoot(document.getElementById('root')).render(

  <StrictMode>
      <RouterProvider router={router}/>
  </StrictMode>,
)
