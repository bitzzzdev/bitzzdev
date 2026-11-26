'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface GalleryImage {
  filename: string;
  title: string;
  description?: string;
  category: string;
  tags: string[];
  date: string;
  order: number;
}

interface WritingPost {
  slug: string;
  title: string;
  description?: string;
  category: string;
  tags: string[];
  date: string;
  published: boolean;
  readingTime?: string;
  order: number;
}

interface TagConfig {
  name: string;
  displayName: string;
  description?: string;
  order: number;
  color?: string;
  icon?: string;
}

export default function DashboardPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'gallery' | 'writings' | 'tags' | 'google-drive'>('gallery');
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [writings, setWritings] = useState<WritingPost[]>([]);
  const [tags, setTags] = useState<TagConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authError, setAuthError] = useState(false);

  // Gallery form state
  const [showGalleryForm, setShowGalleryForm] = useState(false);
  const [galleryForm, setGalleryForm] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    date: new Date().toISOString().split('T')[0],
    file: null as File | null,
  });

  // Writing form state
  const [showWritingForm, setShowWritingForm] = useState(false);
  const [writingForm, setWritingForm] = useState({
    slug: '',
    title: '',
    description: '',
    category: '',
    tags: '',
    date: new Date().toISOString().split('T')[0],
    published: false,
    content: '',
  });

  // Tag form state
  const [showTagForm, setShowTagForm] = useState(false);
  const [editingTag, setEditingTag] = useState<TagConfig | null>(null);
  const [tagForm, setTagForm] = useState({
    name: '',
    displayName: '',
    description: '',
    color: '#6366f1',
    icon: '',
    order: 0,
  });

  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState<{ type: 'gallery' | 'writing' | 'tag'; id: string } | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [galleryRes, writingsRes, tagsRes] = await Promise.all([
        fetch('/api/dashboard/gallery'),
        fetch('/api/dashboard/writings'),
        fetch('/api/dashboard/tags'),
      ]);

      if (galleryRes.status === 401 || writingsRes.status === 401 || tagsRes.status === 401) {
        setAuthError(true);
        router.push('/dashboard/login');
        return;
      }

      if (galleryRes.ok) {
        const data = await galleryRes.json();
        setGalleryImages(data.images || []);
      }
      if (writingsRes.ok) {
        const data = await writingsRes.json();
        setWritings(data.posts || []);
      }
      if (tagsRes.ok) {
        const data = await tagsRes.json();
        setTags(data.tags || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const resetGalleryForm = () => {
    setGalleryForm({
      title: '',
      description: '',
      category: '',
      tags: '',
      date: new Date().toISOString().split('T')[0],
      file: null,
    });
  };

  const resetWritingForm = () => {
    setWritingForm({
      slug: '',
      title: '',
      description: '',
      category: '',
      tags: '',
      date: new Date().toISOString().split('T')[0],
      published: false,
      content: '',
    });
  };

  const handleGallerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryForm.file || !galleryForm.title || !galleryForm.category) return;

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('type', 'gallery');
      formData.append('file', galleryForm.file);
      formData.append('title', galleryForm.title);
      formData.append('description', galleryForm.description);
      formData.append('category', galleryForm.category);
      formData.append('tags', galleryForm.tags);
      formData.append('date', galleryForm.date);

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (res.ok) {
        setShowGalleryForm(false);
        resetGalleryForm();
        loadData();
      } else {
        alert('Upload failed');
      }
    } catch {
      alert('Upload failed');
    } finally {
      setSaving(false);
    }
  };

  const handleWritingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!writingForm.slug || !writingForm.title || !writingForm.category || !writingForm.content) return;

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('type', 'writing');
      formData.append('slug', writingForm.slug);
      formData.append('title', writingForm.title);
      formData.append('description', writingForm.description);
      formData.append('category', writingForm.category);
      formData.append('tags', writingForm.tags);
      formData.append('date', writingForm.date);
      formData.append('published', String(writingForm.published));
      formData.append('content', writingForm.content);

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (res.ok) {
        setShowWritingForm(false);
        resetWritingForm();
        loadData();
      } else {
        alert('Upload failed');
      }
    } catch {
      alert('Upload failed');
    } finally {
      setSaving(false);
    }
  };

  const handleTagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagForm.name) return;

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('type', 'tag');
      formData.append('name', tagForm.name);
      formData.append('displayName', tagForm.displayName);
      formData.append('description', tagForm.description);
      formData.append('color', tagForm.color);
      formData.append('icon', tagForm.icon);
      formData.append('order', String(tagForm.order));

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (res.ok) {
        setShowTagForm(false);
        setEditingTag(null);
        setTagForm({
          name: '',
          displayName: '',
          description: '',
          color: '#6366f1',
          icon: '',
          order: 0,
        });
        loadData();
      } else {
        alert('Tag save failed');
      }
    } catch {
      alert('Tag save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGallery = async (filename: string) => {
    if (!confirm('Delete this image?')) return;
    try {
      const res = await fetch(`/api/dashboard/gallery/${filename}`, { method: 'DELETE' });
      if (res.ok) loadData();
    } catch {
      alert('Delete failed');
    }
  };

  const handleDeleteWriting = async (slug: string) => {
    if (!confirm('Delete this writing?')) return;
    try {
      const res = await fetch(`/api/dashboard/writings/${slug}`, { method: 'DELETE' });
      if (res.ok) loadData();
    } catch {
      alert('Delete failed');
    }
  };

  const handleDeleteTag = async (name: string) => {
    if (!confirm('Delete this tag?')) return;
    try {
      const formData = new FormData();
      formData.append('type', 'tag');
      formData.append('action', 'delete');
      formData.append('name', name);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (res.ok) loadData();
    } catch {
      alert('Delete failed');
    }
  };

  const startEditTag = (tag: TagConfig) => {
    setEditingTag(tag);
    setTagForm({
      name: tag.name,
      displayName: tag.displayName,
      description: tag.description || '',
      color: tag.color || '#6366f1',
      icon: tag.icon || '',
      order: tag.order,
    });
    setShowTagForm(true);
  };

  const handleReorder = async (contentType: 'gallery' | 'writing' | 'tag', items: { id: string; order: number }[]) => {
    try {
      const formData = new FormData();
      formData.append('type', 'reorder');
      formData.append('contentType', contentType);
      formData.append('items', JSON.stringify(items));
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (res.ok) loadData();
    } catch {
      alert('Reorder failed');
    }
  };

  const handleDragStart = (e: React.DragEvent, type: 'gallery' | 'writing' | 'tag', id: string) => {
    setDraggedItem({ type, id });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e: React.DragEvent, targetId: string, targetType: 'gallery' | 'writing' | 'tag') => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === targetId || draggedItem.type !== targetType) return;

    let items: (GalleryImage | WritingPost)[];
    let getId: (item: GalleryImage | WritingPost) => string;

    if (targetType === 'gallery') {
      items = [...galleryImages];
      getId = (item) => (item as GalleryImage).filename;
    } else if (targetType === 'writing') {
      items = [...writings];
      getId = (item) => (item as WritingPost).slug;
    } else {
      return;
    }

    const draggedIndex = items.findIndex(item => getId(item) === draggedItem.id);
    const targetIndex = items.findIndex(item => getId(item) === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const [removed] = items.splice(draggedIndex, 1);
    items.splice(targetIndex, 0, removed);

    const reorderedItems = items.map((item, index) => ({
      id: getId(item),
      order: index,
    }));

    handleReorder(targetType, reorderedItems);
    setDraggedItem(null);
  };

  if (loading) {
    return (
      <section className="am-section dashboard-page" aria-labelledby="dashboard-heading">
        <div className="am-inner">
          <div className="am-section-head">
            <span className="am-eyebrow">/ADMIN</span>
            <h1 className="am-h2" id="dashboard-heading">Dashboard</h1>
          </div>
          <div className="dashboard-loading">Loading...</div>
        </div>
      </section>
    );
  }

  if (authError) {
    return null;
  }

  return (
    <section className="am-section dashboard-page" aria-labelledby="dashboard-heading">
      <div className="am-inner">
        <div className="am-section-head">
          <span className="am-eyebrow">/ADMIN</span>
          <h1 className="am-h2" id="dashboard-heading">Dashboard</h1>
          <p className="am-desc">Manage gallery images, writings, and tags. Drag to reorder.</p>
        </div>

        <div className="dashboard-header">
          <div className="dashboard-tabs" role="tablist" aria-label="Dashboard sections">
            <button
              role="tab"
              aria-selected={activeTab === 'gallery'}
              className={activeTab === 'gallery' ? 'active' : ''}
              onClick={() => setActiveTab('gallery')}
            >
              Gallery ({galleryImages.length})
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'writings'}
              className={activeTab === 'writings' ? 'active' : ''}
              onClick={() => setActiveTab('writings')}
            >
              Writings ({writings.length})
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'tags'}
              className={activeTab === 'tags' ? 'active' : ''}
              onClick={() => setActiveTab('tags')}
            >
              Tags ({tags.length})
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'google-drive'}
              className={activeTab === 'google-drive' ? 'active' : ''}
              onClick={() => setActiveTab('google-drive')}
            >
              Google Drive
            </button>
          </div>
        </div>

        {activeTab === 'gallery' && (
          <GalleryPanel
            images={galleryImages}
            showForm={showGalleryForm}
            setShowForm={setShowGalleryForm}
            form={galleryForm}
            setForm={setGalleryForm}
            onSubmit={handleGallerySubmit}
            onDelete={handleDeleteGallery}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            draggedItem={draggedItem}
            saving={saving}
          />
        )}

        {activeTab === 'writings' && (
          <WritingsPanel
            writings={writings}
            showForm={showWritingForm}
            setShowForm={setShowWritingForm}
            form={writingForm}
            setForm={setWritingForm}
            onSubmit={handleWritingSubmit}
            onDelete={handleDeleteWriting}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            draggedItem={draggedItem}
            saving={saving}
          />
        )}

        {activeTab === 'tags' && (
          <TagsPanel
            tags={tags}
            showForm={showTagForm}
            setShowForm={setShowTagForm}
            editingTag={editingTag}
            setEditingTag={setEditingTag}
            form={tagForm}
            setForm={setTagForm}
            onSubmit={handleTagSubmit}
            onDelete={handleDeleteTag}
            onEdit={startEditTag}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            draggedItem={draggedItem}
            saving={saving}
          />
        )}

        {activeTab === 'google-drive' && (
          <GoogleDrivePanel />
        )}
      </div>
    </section>
  );
}

// Google Drive Panel Component
function GoogleDrivePanel() {
  const [driveConnected, setDriveConnected] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    (async () => {
      try {
        const res = await fetch('/api/gdrive/status');
        const data = await res.json();
        setDriveConnected(!!data?.connected);
      } catch {
        setDriveConnected(false);
      }
    })();
  }, []);

  const startAuth = async () => {
    try {
      const response = await fetch('/api/gdrive/authorize', { method: 'POST' });
      const data = await response.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch {
      // auth error handled by caller
    }
  };

  const handleConnect = () => {
    startAuth();
  };

  const handleDisconnect = async () => {
    try {
      const response = await fetch('/api/gdrive/revoke', { method: 'POST' });
      if (response.ok) {
        setDriveConnected(false);
      }
    } catch {
      // ignore
    }
  };

  if (!driveConnected) {
    return (
      <div className="am-section">
        <div className="am-inner">
          <div className="am-section-head">
            <span className="am-eyebrow">/GOOGLE DRIVE</span>
            <h2 className="am-h2">Google Drive</h2>
            <p className="am-desc">Connect your Google Drive to sync gallery images and writings.</p>
          </div>
          <div className="gallery-empty">
            <p>Google Drive not connected.</p>
            <button onClick={handleConnect} className="gallery-category active">
              Connect Google Drive
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="am-section">
      <div className="am-inner">
        <div className="am-section-head">
          <span className="am-eyebrow">/GOOGLE DRIVE</span>
          <h2 className="am-h2">Google Drive</h2>
          <p className="am-desc">Google Drive connected. Fetch images and writings from Drive folders.</p>
        </div>
        <div className="dashboard-actions">
          <button onClick={handleConnect} className="gallery-category active">
            Refresh from Google Drive
          </button>
          <button onClick={handleDisconnect} className="gallery-category">
            Disconnect Google Drive
          </button>
        </div>
      </div>
    </div>
  );
}

// Gallery Panel Component
function GalleryPanel({
  images,
  showForm,
  setShowForm,
  form,
  setForm,
  onSubmit,
  onDelete,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  draggedItem,
  saving,
}: {
  images: GalleryImage[];
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  form: any;
  setForm: (form: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onDelete: (filename: string) => void;
  onDragStart: (e: React.DragEvent, type: 'gallery' | 'writing' | 'tag', id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetId: string, targetType: 'gallery' | 'writing' | 'tag') => void;
  draggedItem: { type: 'gallery' | 'writing' | 'tag'; id: string } | null;
  saving: boolean;
}) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setForm({ ...form, file: e.target.files[0] });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  if (showForm) {
    return (
      <form onSubmit={onSubmit} className="dashboard-form">
        <div className="dashboard-form-header">
          <h2 className="dashboard-form-title">Add Gallery Image</h2>
          <button type="button" onClick={() => setShowForm(false)} className="dashboard-form-close">Cancel</button>
        </div>

        <div className="dashboard-form-group">
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            name="title"
            type="text"
            value={form.title}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="dashboard-form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleInputChange}
            rows={3}
          />
        </div>

        <div className="dashboard-form-group">
          <label htmlFor="category">Category *</label>
          <input
            id="category"
            name="category"
            type="text"
            value={form.category}
            onChange={handleInputChange}
            required
            placeholder="e.g., photography, digital-art, sketches"
          />
        </div>

        <div className="dashboard-form-group">
          <label htmlFor="tags">Tags (comma-separated)</label>
          <input
            id="tags"
            name="tags"
            type="text"
            value={form.tags}
            onChange={handleInputChange}
            placeholder="tag1, tag2, tag3"
          />
        </div>

        <div className="dashboard-form-group">
          <label htmlFor="date">Date</label>
          <input
            id="date"
            name="date"
            type="date"
            value={form.date}
            onChange={handleInputChange}
          />
        </div>

        <div className="dashboard-form-group">
          <label htmlFor="file">Image File *</label>
          <input
            id="file"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            required
          />
        </div>

        <button type="submit" className="dashboard-form-submit" disabled={saving}>
          {saving ? 'Saving...' : 'Upload Image'}
        </button>
      </form>
    );
  }

  return (
    <div className="dashboard-panel">
      <div className="dashboard-panel-header">
        <h2 className="dashboard-panel-title">Gallery Images</h2>
        <button onClick={() => setShowForm(true)} className="dashboard-btn dashboard-btn-primary">Add Image</button>
      </div>

      {images.length === 0 ? (
        <div className="dashboard-empty">
          <p>No images yet. Click &ldquo;Add Image&rdquo; to upload your first image.</p>
        </div>
      ) : (
        <div className="dashboard-grid" role="list">
          {images.map((image) => (
            <div
              key={image.filename}
              className={`dashboard-item ${draggedItem?.type === 'gallery' && draggedItem?.id === image.filename ? 'dragging' : ''}`}
              draggable
              onDragStart={(e) => onDragStart(e, 'gallery', image.filename)}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={(e) => onDrop(e, image.filename, 'gallery')}
              role="listitem"
            >
              <div className="dashboard-item-image">
                <img src={`/gallery/${image.filename}`} alt={image.title} loading="lazy" />
              </div>
              <div className="dashboard-item-content">
                <h3 className="dashboard-item-title">{image.title}</h3>
                <div className="dashboard-item-meta">
                  <span className="dashboard-item-category">{image.category}</span>
                  <time className="dashboard-item-date" dateTime={image.date}>{new Date(image.date).toLocaleDateString()}</time>
                </div>
                {image.tags.length > 0 && (
                  <div className="dashboard-item-tags">
                    {image.tags.map(tag => <span key={tag} className="dashboard-tag">{tag}</span>)}
                  </div>
                )}
              </div>
              <button
                onClick={() => onDelete(image.filename)}
                className="dashboard-btn dashboard-btn-delete"
                title="Delete"
                aria-label={`Delete ${image.title}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Writings Panel Component
function WritingsPanel({
  writings,
  showForm,
  setShowForm,
  form,
  setForm,
  onSubmit,
  onDelete,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  draggedItem,
  saving,
}: {
  writings: WritingPost[];
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  form: any;
  setForm: (form: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onDelete: (slug: string) => void;
  onDragStart: (e: React.DragEvent, type: 'gallery' | 'writing' | 'tag', id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetId: string, targetType: 'gallery' | 'writing' | 'tag') => void;
  draggedItem: { type: 'gallery' | 'writing' | 'tag'; id: string } | null;
  saving: boolean;
}) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  if (showForm) {
    return (
      <form onSubmit={onSubmit} className="dashboard-form">
        <div className="dashboard-form-header">
          <h2 className="dashboard-form-title">Add Writing</h2>
          <button type="button" onClick={() => setShowForm(false)} className="dashboard-form-close">Cancel</button>
        </div>

        <div className="dashboard-form-row">
          <div className="dashboard-form-group">
            <label htmlFor="slug">Slug *</label>
            <input
              id="slug"
              name="slug"
              type="text"
              value={form.slug}
              onChange={handleInputChange}
              required
              placeholder="my-writing-post"
            />
          </div>
          <div className="dashboard-form-group">
            <label htmlFor="date">Date</label>
            <input
              id="date"
              name="date"
              type="date"
              value={form.date}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="dashboard-form-group">
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            name="title"
            type="text"
            value={form.title}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="dashboard-form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleInputChange}
            rows={2}
          />
        </div>

        <div className="dashboard-form-row">
          <div className="dashboard-form-group">
            <label htmlFor="category">Category *</label>
            <input
              id="category"
              name="category"
              type="text"
              value={form.category}
              onChange={handleInputChange}
              required
              placeholder="e.g., essays, notes, tutorials"
            />
          </div>
          <div className="dashboard-form-group">
            <label htmlFor="tags">Tags (comma-separated)</label>
            <input
              id="tags"
              name="tags"
              type="text"
              value={form.tags}
              onChange={handleInputChange}
              placeholder="tag1, tag2, tag3"
            />
          </div>
        </div>

        <div className="dashboard-form-group dashboard-form-checkbox">
          <label htmlFor="published">
            <input
              id="published"
              name="published"
              type="checkbox"
              checked={form.published}
              onChange={handleInputChange}
            />
            Published
          </label>
        </div>

        <div className="dashboard-form-group">
          <label htmlFor="content">Content (Markdown) *</label>
          <textarea
            id="content"
            name="content"
            value={form.content}
            onChange={handleInputChange}
            rows={20}
            required
            style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}
          />
        </div>

        <button type="submit" className="dashboard-form-submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Writing'}
        </button>
      </form>
    );
  }

  return (
    <div className="dashboard-panel">
      <div className="dashboard-panel-header">
        <h2 className="dashboard-panel-title">Writings</h2>
        <button onClick={() => setShowForm(true)} className="dashboard-btn dashboard-btn-primary">Add Writing</button>
      </div>

      {writings.length === 0 ? (
        <div className="dashboard-empty">
          <p>No writings yet. Click &ldquo;Add Writing&rdquo; to create your first post.</p>
        </div>
      ) : (
        <div className="dashboard-list" role="list">
          {writings.map((writing) => (
            <div
              key={writing.slug}
              className={`dashboard-item ${draggedItem?.type === 'writing' && draggedItem?.id === writing.slug ? 'dragging' : ''}`}
              draggable
              onDragStart={(e) => onDragStart(e, 'writing', writing.slug)}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={(e) => onDrop(e, writing.slug, 'writing')}
              role="listitem"
            >
              <div className="dashboard-item-content">
                <h3 className="dashboard-item-title">{writing.title}</h3>
                <div className="dashboard-item-meta">
                  <span className={`dashboard-badge ${writing.published ? 'dashboard-badge-published' : 'dashboard-badge-draft'}`}>
                    {writing.published ? 'Published' : 'Draft'}
                  </span>
                  <span className="dashboard-item-category">{writing.category}</span>
                  <time className="dashboard-item-date" dateTime={writing.date}>{new Date(writing.date).toLocaleDateString()}</time>
                  {writing.readingTime && <span className="dashboard-item-read-time">{writing.readingTime}</span>}
                </div>
                {writing.tags.length > 0 && (
                  <div className="dashboard-item-tags">
                    {writing.tags.map(tag => <span key={tag} className="dashboard-tag">{tag}</span>)}
                  </div>
                )}
              </div>
              <button
                onClick={() => onDelete(writing.slug)}
                className="dashboard-btn dashboard-btn-delete"
                title="Delete"
                aria-label={`Delete ${writing.title}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Tags Panel Component
function TagsPanel({
  tags,
  showForm,
  setShowForm,
  editingTag,
  setEditingTag,
  form,
  setForm,
  onSubmit,
  onDelete,
  onEdit,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  draggedItem,
  saving,
}: {
  tags: TagConfig[];
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  editingTag: TagConfig | null;
  setEditingTag: (tag: TagConfig | null) => void;
  form: any;
  setForm: (form: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onDelete: (name: string) => void;
  onEdit: (tag: TagConfig) => void;
  onDragStart: (e: React.DragEvent, type: 'gallery' | 'writing' | 'tag', id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetId: string, targetType: 'gallery' | 'writing' | 'tag') => void;
  draggedItem: { type: 'gallery' | 'writing' | 'tag'; id: string } | null;
  saving: boolean;
}) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  if (showForm) {
    return (
      <form onSubmit={onSubmit} className="dashboard-form">
        <div className="dashboard-form-header">
          <h2 className="dashboard-form-title">{editingTag ? 'Edit Tag' : 'Add Tag'}</h2>
          <button type="button" onClick={() => { setShowForm(false); setEditingTag(null); }} className="dashboard-form-close">Cancel</button>
        </div>

        <div className="dashboard-form-group">
          <label htmlFor="name">Name *</label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleInputChange}
            required
            disabled={editingTag !== null}
            placeholder="tag-name"
          />
          {editingTag && <small className="dashboard-form-hint">Name cannot be changed when editing</small>}
        </div>

        <div className="dashboard-form-group">
          <label htmlFor="displayName">Display Name</label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            value={form.displayName}
            onChange={handleInputChange}
            placeholder="Tag Display Name"
          />
        </div>

        <div className="dashboard-form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleInputChange}
            rows={2}
          />
        </div>

        <div className="dashboard-form-row">
          <div className="dashboard-form-group">
            <label htmlFor="color">Color</label>
            <input
              id="color"
              name="color"
              type="color"
              value={form.color}
              onChange={handleInputChange}
            />
          </div>
          <div className="dashboard-form-group">
            <label htmlFor="icon">Icon (emoji)</label>
            <input
              id="icon"
              name="icon"
              type="text"
              value={form.icon}
              onChange={handleInputChange}
              placeholder="🏷️"
              maxLength={2}
            />
          </div>
          <div className="dashboard-form-group">
            <label htmlFor="order">Order</label>
            <input
              id="order"
              name="order"
              type="number"
              value={form.order}
              onChange={handleInputChange}
              min="0"
            />
          </div>
        </div>

        <button type="submit" className="dashboard-form-submit" disabled={saving}>
          {saving ? 'Saving...' : (editingTag ? 'Update Tag' : 'Add Tag')}
        </button>
      </form>
    );
  }

  return (
    <div className="dashboard-panel">
      <div className="dashboard-panel-header">
        <h2 className="dashboard-panel-title">Tags</h2>
        <button
          onClick={() => {
            setEditingTag(null);
            setForm({ name: '', displayName: '', description: '', color: '#6366f1', icon: '', order: tags.length });
            setShowForm(true);
          }}
          className="dashboard-btn dashboard-btn-primary"
        >
          Add Tag
        </button>
      </div>

      {tags.length === 0 ? (
        <div className="dashboard-empty">
          <p>No tags yet. Click &ldquo;Add Tag&rdquo; to create your first tag.</p>
        </div>
      ) : (
        <div className="dashboard-list" role="list">
          {tags.map((tag) => (
            <div
              key={tag.name}
              className={`dashboard-item ${draggedItem?.type === 'tag' && draggedItem?.id === tag.name ? 'dragging' : ''}`}
              draggable
              onDragStart={(e) => onDragStart(e, 'tag', tag.name)}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={(e) => onDrop(e, tag.name, 'tag')}
              role="listitem"
            >
              <div className="dashboard-item-content">
                <div className="dashboard-tag-info">
                  <span className="dashboard-tag-icon" style={{color: tag.color}}>{tag.icon || '🏷️'}</span>
                  <span className="dashboard-tag-name" style={{color: tag.color}}>{tag.displayName || tag.name}</span>
                  <span className="dashboard-tag-slug">({tag.name})</span>
                  {tag.description && <span className="dashboard-tag-description">{tag.description}</span>}
                </div>
                <div className="dashboard-item-meta">
                  <span className="dashboard-tag-order">Order: {tag.order}</span>
                </div>
              </div>
              <div className="dashboard-item-actions">
                <button onClick={() => onEdit(tag)} className="dashboard-btn dashboard-btn-edit" title="Edit" aria-label={`Edit ${tag.name}`}>✎</button>
                <button onClick={() => onDelete(tag.name)} className="dashboard-btn dashboard-btn-delete" title="Delete" aria-label={`Delete ${tag.name}`}>×</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}