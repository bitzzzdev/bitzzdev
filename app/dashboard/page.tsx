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

  const [activeTab, setActiveTab] = useState<'gallery' | 'writings' | 'tags'>('gallery');
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

      // If any request returns 401, redirect to login
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

  const handleReorder = async (contentType: 'gallery' | 'writing', items: { id: string; order: number }[]) => {
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
      return; // tag reorder handled separately
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
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
        </div>
        <div className="dashboard-loading">Loading...</div>
      </div>
    );
  }

  if (authError) {
    return null;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="header-actions">
          <Link href="/" className="view-site-btn">View Site</Link>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={activeTab === 'gallery' ? 'active' : ''}
          onClick={() => setActiveTab('gallery')}
        >
          Gallery ({galleryImages.length})
        </button>
        <button
          className={activeTab === 'writings' ? 'active' : ''}
          onClick={() => setActiveTab('writings')}
        >
          Writings ({writings.length})
        </button>
        <button
          className={activeTab === 'tags' ? 'active' : ''}
          onClick={() => setActiveTab('tags')}
        >
          Tags ({tags.length})
        </button>
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

      <style jsx>{`
        .dashboard-container {
          min-height: 100vh;
          background: var(--bg);
          padding: 2rem;
        }
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-faint);
        }
        .dashboard-header h1 {
          margin: 0;
          font-size: 1.75rem;
          color: var(--text);
        }
        .header-actions {
          display: flex;
          gap: 1rem;
        }
        .view-site-btn {
          padding: 0.5rem 1rem;
          background: var(--bg-elevated);
          border: 1px solid var(--border-faint);
          border-radius: 6px;
          color: var(--text);
          text-decoration: none;
          font-size: 0.9rem;
          transition: all 0.2s;
        }
        .view-site-btn:hover {
          background: var(--bg);
          border-color: var(--text);
        }
        .dashboard-loading {
          text-align: center;
          padding: 3rem;
          color: var(--text-70);
        }
        .dashboard-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid var(--border-faint);
          padding-bottom: 0.5rem;
        }
        .dashboard-tabs button {
          padding: 0.75rem 1.5rem;
          background: transparent;
          border: none;
          color: var(--text-70);
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s;
        }
        .dashboard-tabs button:hover {
          color: var(--text);
          background: var(--bg-elevated);
        }
        .dashboard-tabs button.active {
          color: var(--text);
          background: var(--bg-elevated);
          border-bottom: 2px solid var(--text);
        }
      `}</style>
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
      <div className="panel-form">
        <form onSubmit={onSubmit} className="upload-form">
          <div className="form-header">
            <h2>Add Gallery Image</h2>
            <button type="button" onClick={() => setShowForm(false)} className="close-btn">Cancel</button>
          </div>

          <div className="form-group">
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

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleInputChange}
              rows={3}
            />
          </div>

          <div className="form-group">
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

          <div className="form-group">
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

          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              id="date"
              name="date"
              type="date"
              value={form.date}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="file">Image File *</label>
            <input
              id="file"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={saving}>
            {saving ? 'Saving...' : 'Upload Image'}
          </button>
        </form>

        <style jsx>{`
          .panel-form {
            max-width: 600px;
          }
          .form-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
          }
          .form-header h2 {
            margin: 0;
            font-size: 1.25rem;
          }
          .close-btn {
            padding: 0.5rem 1rem;
            background: transparent;
            border: 1px solid var(--border-faint);
            border-radius: 6px;
            color: var(--text);
            cursor: pointer;
            font-size: 0.9rem;
          }
          .close-btn:hover {
            border-color: var(--text);
          }
          .upload-form {
            background: var(--bg-elevated);
            border: 1px solid var(--border-faint);
            border-radius: 8px;
            padding: 1.5rem;
          }
          .form-group {
            margin-bottom: 1.25rem;
          }
          .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-size: 0.85rem;
            font-weight: 500;
            color: var(--text-70);
          }
          .form-group input,
          .form-group textarea,
          .form-group select {
            width: 100%;
            padding: 0.75rem 1rem;
            background: var(--bg);
            border: 1px solid var(--border-faint);
            border-radius: 6px;
            color: var(--text);
            font-size: 1rem;
            font-family: inherit;
            box-sizing: border-box;
          }
          .form-group input:focus,
          .form-group textarea:focus {
            outline: none;
            border-color: var(--text);
          }
          .submit-btn {
            width: 100%;
            padding: 0.875rem 1.5rem;
            background: var(--text);
            color: var(--bg);
            border: none;
            border-radius: 6px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
          }
          .submit-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="panel-content">
      <div className="panel-header">
        <h2>Gallery Images</h2>
        <button onClick={() => setShowForm(true)} className="add-btn">Add Image</button>
      </div>

      {images.length === 0 ? (
        <div className="empty-state">
          <p>No images yet. Click &ldquo;Add Image&rdquo; to upload your first image.</p>
        </div>
      ) : (
        <div className="gallery-grid">
          {images.map((image) => (
            <div
              key={image.filename}
              className={`gallery-item ${draggedItem?.type === 'gallery' && draggedItem?.id === image.filename ? 'dragging' : ''}`}
              draggable
              onDragStart={(e) => onDragStart(e, 'gallery', image.filename)}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={(e) => onDrop(e, image.filename, 'gallery')}
            >
              <img src={`/gallery/${image.filename}`} alt={image.title} loading="lazy" />
              <div className="item-info">
                <h3>{image.title}</h3>
                <p className="item-category">{image.category}</p>
                <p className="item-tags">{image.tags.join(', ')}</p>
              </div>
              <button
                onClick={() => onDelete(image.filename)}
                className="delete-btn"
                title="Delete"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .panel-header h2 {
          margin: 0;
          font-size: 1.25rem;
        }
        .add-btn {
          padding: 0.625rem 1.25rem;
          background: var(--text);
          color: var(--bg);
          border: none;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
        }
        .add-btn:hover {
          opacity: 0.9;
        }
        .empty-state {
          text-align: center;
          padding: 3rem;
          color: var(--text-70);
          background: var(--bg-elevated);
          border: 1px solid var(--border-faint);
          border-radius: 8px;
        }
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1rem;
        }
        .gallery-item {
          position: relative;
          background: var(--bg-elevated);
          border: 1px solid var(--border-faint);
          border-radius: 8px;
          overflow: hidden;
          cursor: grab;
          transition: all 0.2s;
        }
        .gallery-item.dragging {
          opacity: 0.5;
          border-color: var(--text);
        }
        .gallery-item:active {
          cursor: grabbing;
        }
        .gallery-item img {
          width: 100%;
          height: 180px;
          object-fit: cover;
        }
        .item-info {
          padding: 1rem;
        }
        .item-info h3 {
          margin: 0 0 0.25rem;
          font-size: 1rem;
          color: var(--text);
        }
        .item-category {
          margin: 0 0 0.25rem;
          font-size: 0.8rem;
          color: var(--text-70);
          text-transform: uppercase;
        }
        .item-tags {
          margin: 0;
          font-size: 0.75rem;
          color: var(--text-50);
        }
        .delete-btn {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          width: 28px;
          height: 28px;
          background: rgba(255, 60, 60, 0.9);
          color: white;
          border: none;
          border-radius: 50%;
          font-size: 1.25rem;
          line-height: 1;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .gallery-item:hover .delete-btn {
          opacity: 1;
        }
      `}</style>
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
  draggedItem: { type: string; id: string } | null;
  saving: boolean;
}) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  if (showForm) {
    return (
      <div className="panel-form">
        <form onSubmit={onSubmit} className="upload-form">
          <div className="form-header">
            <h2>Add Writing</h2>
            <button type="button" onClick={() => setShowForm(false)} className="close-btn">Cancel</button>
          </div>

          <div className="form-row">
            <div className="form-group">
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
            <div className="form-group">
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

          <div className="form-group">
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

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleInputChange}
              rows={2}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
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
            <div className="form-group">
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

          <div className="form-group">
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

          <div className="form-group">
            <label htmlFor="content">Content (Markdown) *</label>
            <textarea
              id="content"
              name="content"
              value={form.content}
              onChange={handleInputChange}
              rows={20}
              required
              style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
            />
          </div>

          <button type="submit" className="submit-btn" disabled={saving}>
            {saving ? 'Saving...' : 'Save Writing'}
          </button>
        </form>

        <style jsx>{`
          .panel-form {
            max-width: 800px;
          }
          .form-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
          }
          .form-header h2 {
            margin: 0;
            font-size: 1.25rem;
          }
          .close-btn {
            padding: 0.5rem 1rem;
            background: transparent;
            border: 1px solid var(--border-faint);
            border-radius: 6px;
            color: var(--text);
            cursor: pointer;
            font-size: 0.9rem;
          }
          .close-btn:hover {
            border-color: var(--text);
          }
          .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }
          .upload-form {
            background: var(--bg-elevated);
            border: 1px solid var(--border-faint);
            border-radius: 8px;
            padding: 1.5rem;
          }
          .form-group {
            margin-bottom: 1.25rem;
          }
          .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-size: 0.85rem;
            font-weight: 500;
            color: var(--text-70);
          }
          .form-group input,
          .form-group textarea,
          .form-group select {
            width: 100%;
            padding: 0.75rem 1rem;
            background: var(--bg);
            border: 1px solid var(--border-faint);
            border-radius: 6px;
            color: var(--text);
            font-size: 1rem;
            font-family: inherit;
            box-sizing: border-box;
          }
          .form-group input:focus,
          .form-group textarea:focus {
            outline: none;
            border-color: var(--text);
          }
          .form-group label input[type="checkbox"] {
            margin-right: 0.5rem;
          }
          .submit-btn {
            width: 100%;
            padding: 0.875rem 1.5rem;
            background: var(--text);
            color: var(--bg);
            border: none;
            border-radius: 6px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
          }
          .submit-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="panel-content">
      <div className="panel-header">
        <h2>Writings</h2>
        <button onClick={() => setShowForm(true)} className="add-btn">Add Writing</button>
      </div>

      {writings.length === 0 ? (
        <div className="empty-state">
          <p>No writings yet. Click &ldquo;Add Writing&rdquo; to create your first post.</p>
        </div>
      ) : (
        <div className="writings-list">
          {writings.map((writing) => (
            <div
              key={writing.slug}
              className={`writing-item ${draggedItem?.type === 'writing' && draggedItem?.id === writing.slug ? 'dragging' : ''}`}
              draggable
              onDragStart={(e) => onDragStart(e, 'writing', writing.slug)}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={(e) => onDrop(e, writing.slug, 'writing')}
            >
              <div className="writing-info">
                <h3>{writing.title}</h3>
                <div className="writing-meta">
                  <span className={writing.published ? 'published' : 'draft'}>
                    {writing.published ? 'Published' : 'Draft'}
                  </span>
                  <span className="writing-category">{writing.category}</span>
                  <span className="writing-tags">{writing.tags.join(', ')}</span>
                </div>
              </div>
              <button
                onClick={() => onDelete(writing.slug)}
                className="delete-btn"
                title="Delete"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .panel-header h2 {
          margin: 0;
          font-size: 1.25rem;
        }
        .add-btn {
          padding: 0.625rem 1.25rem;
          background: var(--text);
          color: var(--bg);
          border: none;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
        }
        .add-btn:hover {
          opacity: 0.9;
        }
        .empty-state {
          text-align: center;
          padding: 3rem;
          color: var(--text-70);
          background: var(--bg-elevated);
          border: 1px solid var(--border-faint);
          border-radius: 8px;
        }
        .writings-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .writing-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: var(--bg-elevated);
          border: 1px solid var(--border-faint);
          border-radius: 8px;
          cursor: grab;
          transition: all 0.2s;
        }
        .writing-item.dragging {
          opacity: 0.5;
          border-color: var(--text);
        }
        .writing-item:active {
          cursor: grabbing;
        }
        .writing-info {
          flex: 1;
        }
        .writing-info h3 {
          margin: 0 0 0.5rem;
          font-size: 1rem;
          color: var(--text);
        }
        .writing-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.8rem;
        }
        .writing-meta span {
          padding: 0.125rem 0.5rem;
          border-radius: 4px;
        }
        .published {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
        }
        .draft {
          background: rgba(251, 191, 36, 0.15);
          color: #fbbf24;
        }
        .writing-category {
          color: var(--text-70);
        }
        .writing-tags {
          color: var(--text-50);
        }
        .delete-btn {
          width: 28px;
          height: 28px;
          background: rgba(255, 60, 60, 0.9);
          color: white;
          border: none;
          border-radius: 50%;
          font-size: 1.25rem;
          line-height: 1;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .writing-item:hover .delete-btn {
          opacity: 1;
        }
      `}</style>
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
      <div className="panel-form">
        <form onSubmit={onSubmit} className="upload-form">
          <div className="form-header">
            <h2>{editingTag ? 'Edit Tag' : 'Add Tag'}</h2>
            <button type="button" onClick={() => { setShowForm(false); setEditingTag(null); }} className="close-btn">Cancel</button>
          </div>

          <div className="form-group">
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
            {editingTag && <small style={{color: 'var(--text-50)'}}>Name cannot be changed when editing</small>}
          </div>

          <div className="form-group">
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

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleInputChange}
              rows={2}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="color">Color</label>
              <input
                id="color"
                name="color"
                type="color"
                value={form.color}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
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
            <div className="form-group">
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

          <button type="submit" className="submit-btn" disabled={saving}>
            {saving ? 'Saving...' : (editingTag ? 'Update Tag' : 'Add Tag')}
          </button>
        </form>

        <style jsx>{`
          .panel-form {
            max-width: 600px;
          }
          .form-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
          }
          .form-header h2 {
            margin: 0;
            font-size: 1.25rem;
          }
          .close-btn {
            padding: 0.5rem 1rem;
            background: transparent;
            border: 1px solid var(--border-faint);
            border-radius: 6px;
            color: var(--text);
            cursor: pointer;
            font-size: 0.9rem;
          }
          .close-btn:hover {
            border-color: var(--text);
          }
          .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 1rem;
          }
          .upload-form {
            background: var(--bg-elevated);
            border: 1px solid var(--border-faint);
            border-radius: 8px;
            padding: 1.5rem;
          }
          .form-group {
            margin-bottom: 1.25rem;
          }
          .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-size: 0.85rem;
            font-weight: 500;
            color: var(--text-70);
          }
          .form-group input,
          .form-group textarea,
          .form-group select {
            width: 100%;
            padding: 0.75rem 1rem;
            background: var(--bg);
            border: 1px solid var(--border-faint);
            border-radius: 6px;
            color: var(--text);
            font-size: 1rem;
            font-family: inherit;
            box-sizing: border-box;
          }
          .form-group input:focus,
          .form-group textarea:focus {
            outline: none;
            border-color: var(--text);
          }
          .form-group input[type="color"] {
            height: 44px;
            padding: 0.25rem;
          }
          .submit-btn {
            width: 100%;
            padding: 0.875rem 1.5rem;
            background: var(--text);
            color: var(--bg);
            border: none;
            border-radius: 6px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
          }
          .submit-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="panel-content">
      <div className="panel-header">
        <h2>Tags</h2>
        <button onClick={() => { setEditingTag(null); setForm({ name: '', displayName: '', description: '', color: '#6366f1', icon: '', order: tags.length }); setShowForm(true); }} className="add-btn">Add Tag</button>
      </div>

      {tags.length === 0 ? (
        <div className="empty-state">
          <p>No tags yet. Click &ldquo;Add Tag&rdquo; to create your first tag.</p>
        </div>
      ) : (
        <div className="tags-list">
          {tags.map((tag) => (
            <div
              key={tag.name}
              className={`tag-item ${draggedItem?.type === 'tag' && draggedItem?.id === tag.name ? 'dragging' : ''}`}
              draggable
              onDragStart={(e) => onDragStart(e, 'tag', tag.name)}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={(e) => onDrop(e, tag.name, 'tag')}
            >
              <div className="tag-info">
                <span className="tag-icon" style={{color: tag.color}}>{tag.icon || '🏷️'}</span>
                <span className="tag-name" style={{color: tag.color}}>{tag.displayName || tag.name}</span>
                <span className="tag-slug">({tag.name})</span>
                {tag.description && <span className="tag-description">{tag.description}</span>}
              </div>
              <div className="tag-actions">
                <button onClick={() => onEdit(tag)} className="edit-btn" title="Edit">✎</button>
                <button onClick={() => onDelete(tag.name)} className="delete-btn" title="Delete">×</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .panel-header h2 {
          margin: 0;
          font-size: 1.25rem;
        }
        .add-btn {
          padding: 0.625rem 1.25rem;
          background: var(--text);
          color: var(--bg);
          border: none;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
        }
        .add-btn:hover {
          opacity: 0.9;
        }
        .empty-state {
          text-align: center;
          padding: 3rem;
          color: var(--text-70);
          background: var(--bg-elevated);
          border: 1px solid var(--border-faint);
          border-radius: 8px;
        }
        .tags-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .tag-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          background: var(--bg-elevated);
          border: 1px solid var(--border-faint);
          border-radius: 8px;
          cursor: grab;
          transition: all 0.2s;
        }
        .tag-item.dragging {
          opacity: 0.5;
          border-color: var(--text);
        }
        .tag-item:active {
          cursor: grabbing;
        }
        .tag-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .tag-icon {
          font-size: 1.25rem;
        }
        .tag-name {
          font-weight: 500;
          font-size: 1rem;
        }
        .tag-slug {
          font-size: 0.8rem;
          color: var(--text-50);
        }
        .tag-description {
          font-size: 0.8rem;
          color: var(--text-50);
        }
        .tag-actions {
          display: flex;
          gap: 0.5rem;
        }
        .edit-btn, .delete-btn {
          width: 28px;
          height: 28px;
          border: none;
          border-radius: 50%;
          font-size: 1rem;
          line-height: 1;
          cursor: pointer;
          transition: all 0.2s;
        }
        .edit-btn {
          background: var(--border-faint);
          color: var(--text);
        }
        .edit-btn:hover {
          background: var(--text);
          color: var(--bg);
        }
        .delete-btn {
          background: rgba(255, 60, 60, 0.9);
          color: white;
        }
      `}</style>
    </div>
  );
}