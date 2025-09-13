// BlogPage.jsx — Bootstrap-only, animated, filterable blog index
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Calendar, Clock, Tag, User, ChevronRight, ArrowRight } from 'lucide-react';
import img from '../assets/pexels-steve-1070534.jpg'

// Sample posts (replace with real data or fetch)
const samplePosts = [
  {
    id: 'the-language-of-color',
    title: 'The Language of Color: Emotion in Abstract Art',
    excerpt:
      'Colors speak before shapes do. Explore how hue, saturation, and contrast carry meaning and shape the mood of a painting.',
    image:
      img,
    author: 'ArtistryStudio',
    date: '2025-07-28T09:00:00Z',
    category: 'Studio Notes',
    tags: ['Color Theory', 'Abstract', 'Process'],
    readTime: 7
  },
  {
    id: 'from-canvas-to-collector',
    title: 'From Canvas to Collector: How a Painting Travels',
    excerpt:
      'A behind-the-scenes look at stretching, varnishing, packing, and shipping original artworks safely around the world.',
    image:
      'https://images.pexels.com/photos/3817581/pexels-photo-3817581.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    author: 'ArtistryStudio',
    date: '2025-07-20T10:00:00Z',
    category: 'Studio Notes',
    tags: ['Shipping', 'Varnish', 'Framing'],
    readTime: 6
  },
  {
    id: 'choosing-art-for-your-space',
    title: 'Choosing Art for Your Space: A Practical Guide',
    excerpt:
      'Scale, light, and palette matter. Learn how to select artworks that harmonize with architecture and interior style.',
    image:
      'https://images.pexels.com/photos/1571458/pexels-photo-1571458.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    author: 'Curatorial Team',
    date: '2025-07-12T08:30:00Z',
    category: 'Collectors',
    tags: ['Interior', 'Curation', 'Guide'],
    readTime: 8
  },
  {
    id: 'oil-vs-acrylic',
    title: 'Oil vs. Acrylic: What Collectors Should Know',
    excerpt:
      'Both mediums offer unique character. Understand drying, sheen, archival care, and how they age over time.',
    image:
      'https://images.pexels.com/photos/1646953/pexels-photo-1646953.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    author: 'Materials Lab',
    date: '2025-06-22T11:10:00Z',
    category: 'Materials',
    tags: ['Oil', 'Acrylic', 'Care'],
    readTime: 5
  },
  {
    id: 'workshop-notes',
    title: 'Workshop Notes: Unlocking Gesture and Flow',
    excerpt:
      'Highlights from recent classes—exercises that free your hand, loosen composition, and build confidence.',
    image:
      'https://images.pexels.com/photos/1143754/pexels-photo-1143754.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    author: 'Education Team',
    date: '2025-06-10T14:00:00Z',
    category: 'Workshops',
    tags: ['Workshops', 'Beginner', 'Exercises'],
    readTime: 6
  },
  {
    id: 'care-and-conservation',
    title: 'Care & Conservation: Display and Humidity Basics',
    excerpt:
      'Protecting paintings from UV and humidity is simple with a few practical habits for display and storage.',
    image:
      'https://images.pexels.com/photos/564199/pexels-photo-564199.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    author: 'Materials Lab',
    date: '2025-05-28T09:45:00Z',
    category: 'Materials',
    tags: ['Conservation', 'Display', 'UV'],
    readTime: 9
  },
  {
    id: 'studio-lighting',
    title: 'Studio Lighting: Seeing True Color',
    excerpt:
      'Neutral bulbs, CRI, and color temperature—how lighting choices affect what is seen and ultimately created.',
    image:
      'https://images.pexels.com/photos/1858404/pexels-photo-1858404.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    author: 'ArtistryStudio',
    date: '2025-05-12T16:00:00Z',
    category: 'Studio Notes',
    tags: ['Lighting', 'Color', 'Tools'],
    readTime: 5
  },
  {
    id: 'edition-vs-original',
    title: 'Edition vs. Original: What’s Right for You?',
    excerpt:
      'Limited editions make collecting accessible. Learn how editions are made and what to look for in certificates.',
    image:
      'https://images.pexels.com/photos/1858406/pexels-photo-1858406.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    author: 'Curatorial Team',
    date: '2025-04-30T10:00:00Z',
    category: 'Collectors',
    tags: ['Editions', 'COA', 'Collecting'],
    readTime: 7
  }
];

const allCategories = ['All', ...Array.from(new Set(samplePosts.map(p => p.category)))];
const allTags = Array.from(new Set(samplePosts.flatMap(p => p.tags))).sort();

function BlogPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [tag, setTag] = useState('All');
  const [sortBy, setSortBy] = useState('newest'); // newest | oldest | readtime
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const filtered = useMemo(() => {
    let list = [...samplePosts];

    if (category !== 'All') list = list.filter(p => p.category === category);
    if (tag !== 'All') list = list.filter(p => p.tags.includes(tag));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    switch (sortBy) {
      case 'oldest':
        list.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case 'readtime':
        list.sort((a, b) => a.readTime - b.readTime);
        break;
      default:
        list.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    return list;
  }, [search, category, tag, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const pagePosts = filtered.slice(start, start + pageSize);
  const featured = filtered[0] ?? samplePosts[0];

  const formatDate = iso =>
    new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(iso));

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg,#fff1f2,#fff7ed)' }}>
      {/* Hero Featured */}
      <section className="py-4 py-lg-5">
        <div className="container">
          <div className="card border-0 rounded-4 overflow-hidden shadow-sm">
            <div className="row g-0">
              <div className="col-12 col-lg-7 position-relative">
                <div className="ratio ratio-16x9 h-100">
                  <img src={featured.image} alt={featured.title} className="w-100 h-100 object-fit-cover" />
                </div>
                <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'linear-gradient(to top, rgba(0,0,0,.45), transparent)' }} />
              </div>
              <div className="col-12 col-lg-5 d-flex">
                <div className="p-4 p-lg-5 d-flex flex-column">
                  <span className="badge rounded-pill align-self-start mb-2 bg-white text-danger border">
                    {featured.category}
                  </span>
                  <h1 className="fw-bold h3">{featured.title}</h1>
                  <p className="text-muted mt-2 mb-3 line-clamp-3">{featured.excerpt}</p>

                  <div className="d-flex align-items-center gap-3 text-muted small mb-3">
                    <span className="d-inline-flex align-items-center gap-1">
                      <User size={16} /> {featured.author}
                    </span>
                    <span className="d-inline-flex align-items-center gap-1">
                      <Calendar size={16} /> {formatDate(featured.date)}
                    </span>
                    <span className="d-inline-flex align-items-center gap-1">
                      <Clock size={16} /> {featured.readTime} min
                    </span>
                  </div>

                  <div className="mt-auto">
                    <Link to={`/blog/${featured.id}`} className="btn btn-danger rounded-pill d-inline-flex align-items-center gap-2">
                      Read Article <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-5">
        <div className="container">
          <div className="row g-4 g-lg-5">
            {/* Main */}
            <div className="col-12 col-lg-8">
              {/* Toolbar */}
              <div className="card border-0 shadow-sm rounded-4 mb-3">
                <div className="card-body">
                  <div className="d-flex flex-column flex-md-row align-items-stretch align-items-md-center gap-3 justify-content-between">
                    {/* Search */}
                    <div style={{ maxWidth: 420 }} className="w-100">
                      <div className="input-group">
                        <span className="input-group-text bg-white">
                          <Search size={18} className="text-secondary" />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search posts, tags..."
                          value={search}
                          onChange={e => {
                            setSearch(e.target.value);
                            setPage(1);
                          }}
                        />
                      </div>
                    </div>

                    {/* Sort */}
                    <div className="d-flex align-items-center gap-2">
                      <label className="text-muted small">Sort</label>
                      <select
                        className="form-select"
                        value={sortBy}
                        onChange={e => {
                          setSortBy(e.target.value);
                          setPage(1);
                        }}
                      >
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                        <option value="readtime">Shortest Read</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid */}
              {pagePosts.length === 0 ? (
                <div className="text-center py-5">
                  <div className="display-3 mb-2">🖼️</div>
                  <p className="text-muted mb-0">No posts match the current filters.</p>
                </div>
              ) : (
                <div className="row g-3 g-lg-4">
                  {pagePosts.map((post, idx) => (
                    <motion.div
                      key={post.id}
                      className="col-12 col-md-6"
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: idx * 0.05 }}
                    >
                      <article className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden blog-card">
                        <Link to={`/blog/${post.id}`} className="text-decoration-none text-dark">
                          <div className="ratio ratio-16x9">
                            <img src={post.image} alt={post.title} className="w-100 h-100 object-fit-cover" />
                          </div>
                          <div className="card-body">
                            <div className="d-flex gap-2 align-items-center mb-2">
                              <span className="badge bg-light text-dark border">{post.category}</span>
                              <div className="text-muted small d-none d-sm-inline">
                                <Calendar size={14} className="me-1" />
                                {formatDate(post.date)}
                              </div>
                              <div className="text-muted small d-none d-sm-inline">
                                <Clock size={14} className="me-1" />
                                {post.readTime} min
                              </div>
                            </div>
                            <h3 className="h5 fw-semibold mb-2 line-clamp-2">{post.title}</h3>
                            <p className="text-muted mb-3 line-clamp-3">{post.excerpt}</p>

                            <div className="d-flex align-items-center justify-content-between">
                              <div className="d-flex flex-wrap gap-2 small text-muted">
                                {post.tags.slice(0, 2).map(t => (
                                  <span key={t} className="d-inline-flex align-items-center gap-1">
                                    <Tag size={14} /> {t}
                                  </span>
                                ))}
                              </div>
                              <span className="text-danger d-inline-flex align-items-center gap-1">
                                Read more <ChevronRight size={16} />
                              </span>
                            </div>
                          </div>
                        </Link>
                      </article>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              <nav className="mt-4">
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setPage(p => Math.max(1, p - 1))}>
                      Previous
                    </button>
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                    <li key={n} className={`page-item ${n === currentPage ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => setPage(n)}>
                        {n}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>

            {/* Sidebar */}
            <aside className="col-12 col-lg-4">
              {/* Categories */}
              <div className="card border-0 shadow-sm rounded-4 mb-3">
                <div className="card-body">
                  <h5 className="fw-semibold mb-3">Categories</h5>
                  <div className="vstack gap-2">
                    {allCategories.map(c => (
                      <button
                        key={c}
                        className={`btn btn-sm text-start ${category === c ? 'btn-danger text-white' : 'btn-light'}`}
                        onClick={() => {
                          setCategory(c);
                          setPage(1);
                        }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="card border-0 shadow-sm rounded-4 mb-3">
                <div className="card-body">
                  <h5 className="fw-semibold mb-3">Tags</h5>
                  <div className="d-flex flex-wrap gap-2">
                    <button
                      className={`btn btn-sm ${tag === 'All' ? 'btn-outline-danger' : 'btn-outline-secondary'}`}
                      onClick={() => {
                        setTag('All');
                        setPage(1);
                      }}
                    >
                      All
                    </button>
                    {allTags.map(t => (
                      <button
                        key={t}
                        className={`btn btn-sm ${tag === t ? 'btn-danger' : 'btn-outline-secondary'}`}
                        onClick={() => {
                          setTag(t);
                          setPage(1);
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Newsletter */}
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body">
                  <h5 className="fw-semibold mb-2">Subscribe</h5>
                  <p className="text-muted small">Get new posts, studio news, and workshop dates.</p>
                  <div className="d-flex gap-2">
                    <input className="form-control" type="email" placeholder="Email address" />
                    <button className="btn btn-danger">Join</button>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}

export default BlogPage;    