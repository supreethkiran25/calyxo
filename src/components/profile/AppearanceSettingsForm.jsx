import React, { memo } from 'react';
import { Settings, Sparkles, Moon, Sun } from 'lucide-react';
import { useStore } from '../../store/useStore';

const AppearanceSettingsForm = memo(({ bgEffectsEnabled, setBgEffectsEnabled, themeMode, setThemeMode, onSave, saving }) => {
  const setTheme = useStore(state => state.setTheme);

  const handleThemeChange = (mode) => {
    setThemeMode(mode);
    setTheme(mode);
  };

  return (
    <div className="bg-card-bg/60 border border-card-border rounded-3xl p-6 sm:p-8 backdrop-blur-xl space-y-6">
      <div className="flex items-center gap-3 border-b border-card-border pb-4">
        <div className="p-2.5 rounded-2xl bg-acid-green/10 text-acid-green">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-black tracking-tight text-foreground">Appearance & Theme</h3>
          <p className="text-xs text-muted">Customize visual theme and dynamic background effects</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Theme Mode</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'light', label: 'Light', icon: Sun },
              { id: 'obsidian', label: 'Dark (Obsidian)', icon: Moon },
              { id: 'solarized', label: 'Solarized', icon: Sparkles },
              { id: 'emerald', label: 'Emerald', icon: Sparkles },
            ].map(t => {
              const Icon = t.icon;
              const active = themeMode === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleThemeChange(t.id)}
                  className={`p-4 rounded-2xl flex flex-col items-center gap-2 border font-bold text-xs transition-all cursor-pointer ${
                    active ? 'bg-acid-green/10 border-acid-green text-acid-green' : 'bg-surface border-card-border text-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-surface border border-card-border">
          <div>
            <span className="block text-sm font-bold text-foreground">Dynamic Background Canvas</span>
            <span className="text-xs text-muted">Enable GPU particle/mesh background animation</span>
          </div>
          <input 
            type="checkbox"
            checked={bgEffectsEnabled}
            onChange={(e) => setBgEffectsEnabled(e.target.checked)}
            className="w-5 h-5 accent-acid-green cursor-pointer"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button 
          onClick={onSave}
          disabled={saving}
          className="px-6 py-3 rounded-2xl bg-acid-green text-black text-xs font-black uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer border-none"
        >
          {saving ? 'Saving...' : 'Save Appearance'}
        </button>
      </div>
    </div>
  );
});

export default AppearanceSettingsForm;
