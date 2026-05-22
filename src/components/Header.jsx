import { Archive, BookOpen, Clock, Library, Moon, Search, Star, Sun } from 'lucide-react';
import { TABS } from '../constants.js';

const tabIcons = {
  catalogo: Library,
  lectura: BookOpen,
  reservas: Archive,
  favoritos: Star,
  historial: Clock,
};

function Header({
  currentTab,
  searchInput,
  theme,
  onLogoClick,
  onSearch,
  onSearchInput,
  onTabChange,
  onToggleTheme,
}) {
  function handleSubmit(event) {
    event.preventDefault();
    onSearch();
  }

  return (
    <header>
      <div className="header-inner">
        <button className="logo" onClick={onLogoClick} title="Volver al catalogo">
          Campus <em>Library</em>
        </button>

        <form className="search-bar" onSubmit={handleSubmit}>
          <input
            aria-label="Buscar libros"
            placeholder="Buscar por titulo, autor o ISBN..."
            type="search"
            value={searchInput}
            onChange={(event) => onSearchInput(event.target.value)}
          />
          <button className="btn btn-primary" type="submit">
            <Search size={16} />
            Buscar
          </button>
        </form>

        <button className="icon-btn" onClick={onToggleTheme} title="Cambiar tema" aria-label="Cambiar tema">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <nav className="nav-tabs" role="tablist" aria-label="Secciones de biblioteca">
        {TABS.map((tab) => {
          const Icon = tabIcons[tab.id];
          const active = currentTab === tab.id;
          return (
            <button
              className={`nav-tab ${active ? 'active' : ''}`}
              key={tab.id}
              role="tab"
              aria-selected={active}
              onClick={() => onTabChange(tab.id)}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}

export default Header;
