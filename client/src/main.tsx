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
import AdminProduct from './pages/admin-page/product/product'
import AdminTag from './pages/admin-page/tag/tag'
import AdminCategory from './pages/admin-page/category/category'
import AdminOrder from './pages/admin-page/order/order'
import { AuthProvider } from './contexts/auth/auth'
import { CardProvider } from './contexts/cart/cart'
import ProductPage from './pages/product/product'
import CheckoutPage from './pages/checkout/checkout'
import InfoPage from './pages/info/info'
import OrderPage from './pages/order/order'
import OrderDetailPage from './pages/order-detail/order-detail'
import AboutPage from './pages/about/About'
import CertificatePage from './pages/certificate/certificate'
import ImagePage from './pages/image/image'

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
      <ModalConfirmProvider>
        <ToastMessageProvider>
          <AuthProvider>
            <CardProvider>
              <Routes>

                <Route path='/' element={<Layout />}>
                {/* Home page */}
                <Route path='/' element={<HomePage />} />
                {/* Auth service page */}
                <Route path='/auth/login' element={<LoginPage />} />
                <Route path='/auth/register' element={<RegisterPage />} />

                {/* Feature service page */}
                <Route path='/page/product' element={<ProductPage />} />
                <Route path='/page/cart' element={<CartPage />} />
                <Route path='/page/checkout' element={<CheckoutPage />} />
                <Route path='/page/info' element={<InfoPage />} />
                <Route path='/page/orders' element={<OrderPage />} />
                <Route path='/page/orders/:uuid' element={<OrderDetailPage />} />
                <Route path='/page/payment' element={<PaymentPage />} />
                <Route path='/page/about' element={<AboutPage />} />
                <Route path='/page/testing' element={<CertificatePage />} />
                <Route path='/page/image' element={<ImagePage />} />
              </Route>

            {/* Admin service page */}
            <Route path='/admin' element={<AdminLayout />} >
              <Route path='/admin/' element={<AdminDashboard />} />
              <Route path='/admin/dashboard' element={<AdminDashboard />} />
              <Route path='/admin/accounts' element={<AdminAccount />} />
              <Route path='/admin/products' element={<AdminProduct />} />
              <Route path='/admin/orders' element={<AdminOrder />} />
              <Route path='/admin/category' element={<AdminCategory />} />
              <Route path='/admin/tag' element={<AdminTag />} />
              <Route path='/admin/category' element={<AdminCategory />} />
              <Route path='/admin/tag' element={<AdminTag />} />
            </Route>

              </Routes>
            </CardProvider>
          </AuthProvider>
        </ToastMessageProvider>
      </ModalConfirmProvider>
    </BrowserRouter>
)