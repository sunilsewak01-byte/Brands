import React from 'react';
import { PortfolioProvider, usePortfolio } from './context/PortfolioContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ProductDossierModal from './components/ProductDossierModal';
import AuditTrailModal from './components/AuditTrailModal';
import ProductDrilldownModal from './components/ProductDrilldownModal';
import Toast from './components/Toast';

// Pages
import ExecutiveDashboardPage from './pages/ExecutiveDashboardPage';
import TherapeuticAnalyticsPage from './pages/TherapeuticAnalyticsPage';
import MoleculesPage from './pages/MoleculesPage';
import CommercialTeamsPage from './pages/CommercialTeamsPage';
import InnovatorLandscapePage from './pages/InnovatorLandscapePage';
import ProductExplorerPage from './pages/ProductExplorerPage';
import ReconcileEnginePage from './pages/ReconcileEnginePage';

function AppContent() {
  const { activePage, dossierProduct, auditGroup, drilldownModalInfo } = usePortfolio();

  const renderActivePage = () => {
    switch (activePage) {
      case 'overview':
        return <ExecutiveDashboardPage />;
      case 'therapeutic':
        return <TherapeuticAnalyticsPage />;
      case 'molecules':
        return <MoleculesPage />;
      case 'commercial':
        return <CommercialTeamsPage />;
      case 'innovators':
        return <InnovatorLandscapePage />;
      case 'explorer':
        return <ProductExplorerPage />;
      case 'reconcile':
        return <ReconcileEnginePage />;
      default:
        return <ExecutiveDashboardPage />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100/70 font-sans antialiased text-slate-800">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Navbar */}
        <Navbar />

        {/* Dynamic Page Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {renderActivePage()}
        </main>

        {/* Global Footer */}
        <footer className="bg-white border-t border-slate-200/80 px-6 py-2.5 text-center text-xs text-slate-400 select-none">
          Pharmaceutical Portfolio Reconciler & Executive Analytics Studio &bull; Client-Side Secure & Confidential
        </footer>
      </div>

      {/* Modals & Overlays */}
      {dossierProduct && <ProductDossierModal />}
      {auditGroup && <AuditTrailModal />}
      {drilldownModalInfo && <ProductDrilldownModal />}
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <PortfolioProvider>
      <AppContent />
    </PortfolioProvider>
  );
}
