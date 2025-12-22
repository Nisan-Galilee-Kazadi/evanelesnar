import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';

// Admin Imports
import AdminRoute from './components/AdminRoute';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import EventsManager from './pages/admin/EventsManager';
import Orders from './pages/admin/Orders';
import EventDetails from './pages/admin/EventDetails';
import MediaManager from './pages/admin/MediaManager';
import Settings from './pages/admin/Settings';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-slate-950">
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<Login />} />

          <Route path="/admin" element={<AdminRoute />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="events" element={<EventsManager />} />
            <Route path="events/:id" element={<EventDetails />} />
            <Route path="orders" element={<Orders />} />
            <Route path="media" element={<MediaManager />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
