import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import Layout from './pages/layout'
import LoginPage from './pages/login/login'
import RegisterPage from './pages/register/register'
import HomePage from './pages/home/home'
import CartPage from './pages/cart/cart'
import PaymentPage from './pages/payment/payment'
import { ToastMessageProvider } from './contexts/toast-message/toast-message'
import { ModalConfirmProvider } from './contexts/modal-confirm/modal-confirm'
import AdminDashboard from './pages/admin-page/dashboard/dashboard'
import AdminLayout from './pages/admin-page/layout'
import AdminAccount from './pages/admin-page/account/account'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ModalConfirmProvider>
        <ToastMessageProvider>
          <Routes>

            <Route path='/' element={<Layout />}>
              {/* Home page */}
              <Route path='/' element={<HomePage />} />
              {/* Auth service page */}
              <Route path='/auth/login' element={<LoginPage />} />
              <Route path='/auth/register' element={<RegisterPage />} />

              {/* Feature service page */}
              <Route path='/page/cart' element={<CartPage />} />
              <Route path='/page/payment' element={<PaymentPage />} />
            </Route>

            {/* Admin service page */}
            <Route path='/admin' element={<AdminLayout />} >
              <Route path='/admin/' element={<AdminDashboard />} />
              <Route path='/admin/dashboard' element={<AdminDashboard />} />
              <Route path='/admin/accounts' element={<AdminAccount />} />
            </Route>

          </Routes>
        </ToastMessageProvider>
      </ModalConfirmProvider>
    </BrowserRouter>
  </StrictMode>,
)
