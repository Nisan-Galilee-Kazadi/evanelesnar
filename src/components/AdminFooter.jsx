import { Link } from "react-router-dom";

const AdminFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="show md:block bg-slate-900 border-t border-slate-800 py-[14px] px-6 text-slate-500 text-sm">
      <div className="flex items-center justify-between">
        <p>{currentYear} Evan Lesnar. Tous droits réservés.</p>
        <div className="flex items-center space-x-4">
          <Link to="/terms" className="hover:text-purple-400 transition-colors">
            Conditions d'utilisation
          </Link>
        
        </div>
      </div>
    </footer>
  );
};

export default AdminFooter;
