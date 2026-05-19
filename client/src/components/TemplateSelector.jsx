import { Crown, Lock, Star, Heart } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { TEMPLATE_LIST } from '../templates/index';
import './TemplateSelector.css';

export default function TemplateSelector({ currentTemplate = 'default', onSelect, onUpgradeClick }) {
  const { isPro, favouriteTemplates } = useSubscription();

  return (
    <div className="tmpl-selector">
      <div className="tmpl-selector-header">
        <h3 className="tmpl-selector-title">
          <span>Resume Templates</span>
          {isPro && <span className="tmpl-pro-badge"><Crown size={11} /> Pro</span>}
        </h3>
        {!isPro && (
          <button className="tmpl-upgrade-btn" onClick={onUpgradeClick} id="btn-tmpl-upgrade">
            <Crown size={12} /> Unlock All
          </button>
        )}
      </div>

      {favouriteTemplates.length > 0 && (
        <div className="tmpl-favourites-row">
          <span className="tmpl-fav-label"><Heart size={10} fill="currentColor" /> Favourites</span>
          {favouriteTemplates.map(id => {
            const tmpl = TEMPLATE_LIST.find(t => t.id === id);
            if (!tmpl) return null;
            return (
              <button
                key={id}
                className={`tmpl-fav-chip ${currentTemplate === id ? 'active' : ''}`}
                onClick={() => onSelect(id)}
              >
                {tmpl.name}
              </button>
            );
          })}
        </div>
      )}

      <div className="tmpl-grid">
        {TEMPLATE_LIST.map(tmpl => {
          const locked   = tmpl.isPro && !isPro;
          const isActive = currentTemplate === tmpl.id;
          return (
            <button
              key={tmpl.id}
              className={`tmpl-card ${isActive ? 'tmpl-card-active' : ''} ${locked ? 'tmpl-card-locked' : ''}`}
              onClick={() => locked ? onUpgradeClick?.() : onSelect(tmpl.id)}
              title={tmpl.description}
              id={`tmpl-${tmpl.id}`}
            >
              {/* Visual mini-preview */}
              <div className="tmpl-preview" style={{ '--tmpl-header': tmpl.preview.header, '--tmpl-accent': tmpl.preview.accent, '--tmpl-bg': tmpl.preview.bg }}>
                <div className="tmpl-preview-header" />
                <div className="tmpl-preview-lines">
                  <div className="tmpl-preview-line tmpl-preview-line-wide" />
                  <div className="tmpl-preview-line" />
                  <div className="tmpl-preview-line tmpl-preview-line-short" />
                  <div className="tmpl-preview-line tmpl-preview-line-wide" />
                  <div className="tmpl-preview-line" />
                </div>
                {locked && (
                  <div className="tmpl-lock-overlay">
                    <Lock size={16} />
                  </div>
                )}
                {isActive && (
                  <div className="tmpl-active-check">✓</div>
                )}
              </div>

              <div className="tmpl-info">
                <span className="tmpl-name">{tmpl.name}</span>
                {tmpl.isPro && !isPro && <span className="tmpl-pro-label"><Crown size={9} /> Pro</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
