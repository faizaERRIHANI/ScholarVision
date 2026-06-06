import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

export default function Layout() {
  return (
    <div style={{ backgroundColor:'#f8fafc', minHeight:'100vh' }}>
      <Sidebar />
      <Header />
      <main style={{ marginLeft:'var(--sidebar-w)', paddingTop:'var(--header-h)', minHeight:'100vh' }}>
        <div style={{ padding:28 }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
