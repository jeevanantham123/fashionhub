'use client';

import { useEffect, useState } from 'react';
import { themeApi, homeSectionApi, productApi } from '@/lib/api';
import { HomeSection, ThemeSettings } from '@/types';
import { useThemeStore } from '@/store/themeStore';
import { Eye, EyeOff, GripVertical, Trash2, Plus, Save, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const HEADING_FONTS = ['Playfair Display', 'Cormorant', 'Raleway', 'Montserrat', 'Lora'];
const BODY_FONTS = ['Inter', 'Poppins', 'DM Sans', 'Nunito', 'Open Sans'];
const SECTION_TYPES = ['hero', 'featured', 'categories', 'promo', 'newsletter'];

export default function AdminTheme() {
  const [activeTab, setActiveTab] = useState<'theme' | 'sections'>('theme');
  const [theme, setTheme] = useState<ThemeSettings>({
    'primary-color': '#C9A84C',
    'secondary-color': '#1A1A2E',
    'background-color': '#FAFAF8',
    'text-color': '#1A1A1A',
    'accent-color': '#E8D5A3',
    'heading-font': 'Playfair Display',
    'body-font': 'Inter',
    'logo-text': 'FashionHub',
    tagline: 'Dress to Impress',
  });
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [editingSection, setEditingSection] = useState<HomeSection | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { applyTheme } = useThemeStore();
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);

  useEffect(() => {
    themeApi.get().then(({ data }) => setTheme(data));
    homeSectionApi.listAll().then(({ data }) => setSections(data));
  }, []);

  const handleThemeChange = (key: string, value: string) => {
    const updated = { ...theme, [key]: value };
    setTheme(updated);
    applyTheme(updated);
  };

  const saveTheme = async () => {
    setIsSaving(true);
    try {
      await themeApi.update(theme);
      applyTheme(theme);
      toast.success('Theme saved!');
    } catch { toast.error('Failed to save theme'); }
    setIsSaving(false);
  };

  const toggleSection = async (section: HomeSection) => {
    await homeSectionApi.update(section.id, { visible: !section.visible });
    setSections(s => s.map(sec => sec.id === section.id ? { ...sec, visible: !sec.visible } : sec));
  };

  const deleteSection = async (id: string) => {
    if (!confirm('Delete this section?')) return;
    await homeSectionApi.delete(id);
    setSections(s => s.filter(sec => sec.id !== id));
    toast.success('Section deleted');
  };

  const addSection = async (type: string) => {
    const { data } = await homeSectionApi.create({ type, title: `New ${type} section`, subtitle: '', visible: true });
    setSections(s => [...s, data]);
    setEditingSection(data);
    toast.success('Section added');
  };

  const saveSection = async () => {
    if (!editingSection) return;
    await homeSectionApi.update(editingSection.id, editingSection);
    setSections(s => s.map(sec => sec.id === editingSection.id ? editingSection : sec));
    setEditingSection(null);
    toast.success('Section saved!');
  };

  const handleDragStart = (i: number) => setDragging(i);
  const handleDragOver = (e: React.DragEvent, i: number) => { e.preventDefault(); setDragOver(i); };
  const handleDrop = async (targetIdx: number) => {
    if (dragging === null || dragging === targetIdx) { setDragging(null); setDragOver(null); return; }
    const reordered = [...sections];
    const [moved] = reordered.splice(dragging, 1);
    reordered.splice(targetIdx, 0, moved);
    setSections(reordered);
    setDragging(null);
    setDragOver(null);
    await homeSectionApi.reorder(reordered.map(s => s.id));
    toast.success('Sections reordered');
  };

  return (
    <div className="space-y-4 max-w-5xl">
      <h1 className="text-2xl font-heading font-bold">Theme & Homepage</h1>

      {/* Tabs */}
      <div className="flex border-b">
        {(['theme', 'sections'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${activeTab === tab ? '' : 'border-transparent text-gray-500 hover:text-gray-700'}`} style={activeTab === tab ? { borderColor: 'var(--primary)', color: 'var(--primary)' } : {}}>
            {tab === 'theme' ? 'Theme Customizer' : 'Homepage Sections'}
          </button>
        ))}
      </div>

      {/* Theme Customizer */}
      {activeTab === 'theme' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Colors */}
            <div className="bg-white rounded-lg border p-5 space-y-4">
              <h2 className="font-semibold">Colors</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'primary-color', label: 'Primary (buttons, accents)' },
                  { key: 'secondary-color', label: 'Secondary (dark elements)' },
                  { key: 'background-color', label: 'Page Background' },
                  { key: 'text-color', label: 'Body Text' },
                  { key: 'accent-color', label: 'Accent (highlights)' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-3">
                    <input type="color" value={theme[key] || '#000000'} onChange={e => handleThemeChange(key, e.target.value)} className="w-12 h-10 rounded border cursor-pointer p-0.5" />
                    <div className="flex-1 min-w-0">
                      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
                      <input value={theme[key] || ''} onChange={e => handleThemeChange(key, e.target.value)} className="w-full px-2 py-1 border rounded text-sm font-mono" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Typography */}
            <div className="bg-white rounded-lg border p-5 space-y-4">
              <h2 className="font-semibold">Typography</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Heading Font</label>
                  <select value={theme['heading-font'] || 'Playfair Display'} onChange={e => handleThemeChange('heading-font', e.target.value)} className="input">
                    {HEADING_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                  <p className="mt-2 text-xl" style={{ fontFamily: theme['heading-font'] }}>The quick brown fox</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Body Font</label>
                  <select value={theme['body-font'] || 'Inter'} onChange={e => handleThemeChange('body-font', e.target.value)} className="input">
                    {BODY_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                  <p className="mt-2 text-sm" style={{ fontFamily: theme['body-font'] }}>The quick brown fox jumps over the lazy dog</p>
                </div>
              </div>
            </div>

            {/* General */}
            <div className="bg-white rounded-lg border p-5 space-y-4">
              <h2 className="font-semibold">General</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Logo Text</label>
                  <input value={theme['logo-text'] || ''} onChange={e => handleThemeChange('logo-text', e.target.value)} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Store Tagline</label>
                  <input value={theme['tagline'] || ''} onChange={e => handleThemeChange('tagline', e.target.value)} className="input" />
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              <div className="bg-white rounded-lg border p-4">
                <h3 className="font-semibold mb-3 text-sm">Live Preview</h3>
                <div className="rounded-lg overflow-hidden border" style={{ backgroundColor: theme['background-color'], color: theme['text-color'] }}>
                  <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
                    <span className="font-bold text-lg" style={{ fontFamily: theme['heading-font'], color: theme['primary-color'] }}>{theme['logo-text']}</span>
                    <div className="flex gap-2 text-xs text-gray-400">Shop · Cart · User</div>
                  </div>
                  <div className="p-4" style={{ backgroundColor: theme['secondary-color'] }}>
                    <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: theme['heading-font'] }}>New Arrivals</h2>
                    <p className="text-sm mb-3" style={{ color: theme['accent-color'], fontFamily: theme['body-font'] }}>{theme.tagline}</p>
                    <button className="px-4 py-2 text-sm rounded text-white font-medium" style={{ backgroundColor: theme['primary-color'] }}>Shop Now</button>
                  </div>
                  <div className="p-4">
                    <p className="text-sm mb-3" style={{ fontFamily: theme['heading-font'], fontWeight: 600 }}>Featured Products</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[1,2,3].map(i => (
                        <div key={i} className="aspect-square rounded" style={{ backgroundColor: theme['accent-color'] }} />
                      ))}
                    </div>
                    <button className="w-full mt-3 py-2 text-xs rounded text-white" style={{ backgroundColor: theme['primary-color'] }}>Add to Cart</button>
                  </div>
                </div>
              </div>
              <button onClick={saveTheme} disabled={isSaving} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
                <Save size={16} /> {isSaving ? 'Saving...' : 'Save Theme'}
              </button>
              <button onClick={() => themeApi.get().then(({ data }) => { setTheme(data); applyTheme(data); })} className="btn-secondary w-full flex items-center justify-center gap-2 text-sm">
                <RefreshCw size={14} /> Reset to Saved
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Homepage Sections */}
      {activeTab === 'sections' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Drag to reorder. Toggle visibility or edit content.</p>
              <div className="flex gap-2">
                {SECTION_TYPES.map(t => (
                  <button key={t} onClick={() => addSection(t)} className="px-3 py-1.5 text-xs border rounded hover:bg-gray-50 capitalize">{t}</button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {sections.map((section, i) => (
                <div key={section.id} draggable onDragStart={() => handleDragStart(i)} onDragOver={e => handleDragOver(e, i)} onDrop={() => handleDrop(i)} className={`bg-white rounded-lg border p-4 cursor-move transition-all ${dragOver === i ? 'border-dashed border-2' : ''} ${!section.visible ? 'opacity-50' : ''}`} style={dragOver === i ? { borderColor: 'var(--primary)' } : {}}>
                  <div className="flex items-center gap-3">
                    <GripVertical size={16} className="text-gray-300 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 capitalize">{section.type}</span>
                        <span className="font-medium text-sm">{section.title || '(untitled)'}</span>
                      </div>
                      {section.subtitle && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{section.subtitle}</p>}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => toggleSection(section)} className="p-1.5 hover:bg-gray-100 rounded" title={section.visible ? 'Hide' : 'Show'}>
                        {section.visible ? <Eye size={15} /> : <EyeOff size={15} className="text-gray-400" />}
                      </button>
                      <button onClick={() => setEditingSection({ ...section })} className="p-1.5 hover:bg-blue-50 text-blue-500 rounded text-xs font-medium px-3 py-1 border border-blue-200">Edit</button>
                      <button onClick={() => deleteSection(section.id)} className="p-1.5 hover:bg-red-50 text-red-400 rounded"><Trash2 size={15} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section editor */}
          <div className="lg:col-span-1">
            {editingSection ? (
              <div className="bg-white rounded-lg border p-5 space-y-4 sticky top-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold capitalize">{editingSection.type} Section</h3>
                  <button onClick={() => setEditingSection(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Title</label>
                  <input value={editingSection.title} onChange={e => setEditingSection(s => s ? { ...s, title: e.target.value } : s)} className="input text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Subtitle</label>
                  <textarea value={editingSection.subtitle} onChange={e => setEditingSection(s => s ? { ...s, subtitle: e.target.value } : s)} rows={2} className="input text-sm resize-none" />
                </div>
                {(editingSection.type === 'hero' || editingSection.type === 'promo') && (
                  <div>
                    <label className="block text-xs font-medium mb-1">Background Image URL</label>
                    <input value={editingSection.imageUrl || ''} onChange={e => setEditingSection(s => s ? { ...s, imageUrl: e.target.value } : s)} placeholder="https://..." className="input text-sm" />
                    {editingSection.imageUrl && <img src={editingSection.imageUrl} alt="" className="mt-2 w-full h-24 object-cover rounded" />}
                  </div>
                )}
                {editingSection.type === 'promo' && (
                  <div>
                    <label className="block text-xs font-medium mb-1">Background Color</label>
                    <input type="color" value={editingSection.content?.backgroundColor || '#1A1A2E'} onChange={e => setEditingSection(s => s ? { ...s, content: { ...s.content, backgroundColor: e.target.value } } : s)} className="w-12 h-9 rounded border p-0.5" />
                  </div>
                )}
                {(editingSection.type === 'hero' || editingSection.type === 'promo' || editingSection.type === 'featured') && (
                  <>
                    <div>
                      <label className="block text-xs font-medium mb-1">Button Text</label>
                      <input value={editingSection.buttonText || ''} onChange={e => setEditingSection(s => s ? { ...s, buttonText: e.target.value } : s)} className="input text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Button Link</label>
                      <input value={editingSection.buttonLink || ''} onChange={e => setEditingSection(s => s ? { ...s, buttonLink: e.target.value } : s)} placeholder="/products" className="input text-sm" />
                    </div>
                  </>
                )}
                {editingSection.type === 'newsletter' && (
                  <div>
                    <label className="block text-xs font-medium mb-1">Input Placeholder</label>
                    <input value={editingSection.content?.placeholder || ''} onChange={e => setEditingSection(s => s ? { ...s, content: { ...s.content, placeholder: e.target.value } } : s)} className="input text-sm" />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="vis" checked={editingSection.visible} onChange={e => setEditingSection(s => s ? { ...s, visible: e.target.checked } : s)} />
                  <label htmlFor="vis" className="text-sm">Visible</label>
                </div>
                <button onClick={saveSection} className="btn-primary w-full flex items-center justify-center gap-2 text-sm">
                  <Save size={14} /> Save Section
                </button>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg border-2 border-dashed p-8 text-center text-gray-400">
                <Plus size={24} className="mx-auto mb-2" />
                <p className="text-sm">Click "Edit" on a section to customize it</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
