import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Calendar, Clock, Tag, User, ChevronRight, ArrowRight } from 'lucide-react';

const samplePosts = [
  {
    id: 'the-language-of-color',
    title: 'The Language of Color: Emotion in Abstract Art',
    excerpt: 'Colors speak before shapes do. Explore how hue, saturation, and contrast carry meaning and shape the mood of a painting.',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    author: 'ArtistryStudio',
    date: '2025-07-28T09:00:00Z',
    category: 'Studio Notes',
    tags: ['Color Theory', 'Abstract', 'Process'],
    readTime: 7
  },
  {
    id: 'from-canvas-to-collector',
    title: 'From Canvas to Collector: How a Painting Travels',
    excerpt: 'A behind-the-scenes look at stretching, varnishing, packing, and shipping original artworks safely around the world.',
    image: 'https://images.pexels.com/photos/3817581/pexels-photo-3817581.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    author: 'ArtistryStudio',
    date: '2025-07-20T10:00:00Z',
    category: 'Studio Notes',
    tags: ['Shipping', 'Varnish', 'Framing'],
    readTime: 6
  },
  {
    id: 'choosing-art-for-your-space',
    title: 'Choosing Art for Your Space: A Practical Guide',
    excerpt: 'Scale, light, and palette matter. Learn how to select artworks that harmonize with architecture and interior style.',
    image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80',
    author: 'Curatorial Team',
    date: '2025-07-12T08:30:00Z',
    category: 'Collectors',
    tags: ['Interior', 'Curation', 'Guide'],
    readTime: 8
  },
  {
    id: 'oil-vs-acrylic',
    title: 'Oil vs. Acrylic: What Collectors Should Know',
    excerpt: 'Both mediums offer unique character. Understand drying, sheen, archival care, and how they age over time.',
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80',
    author: 'Materials Lab',
    date: '2025-06-22T11:10:00Z',
    category: 'Materials',
    tags: ['Oil', 'Acrylic', 'Care'],
    readTime: 5
  },
  {
    id: 'workshop-notes',
    title: 'Workshop Notes: Unlocking Gesture and Flow',
    excerpt: 'Highlights from recent classes—exercises that free your hand, loosen composition, and build confidence.',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    author: 'Education Team',
    date: '2025-06-10T14:00:00Z',
    category: 'Workshops',
    tags: ['Workshops', 'Beginner', 'Exercises'],
    readTime: 6
  },
  {
    id: 'care-and-conservation',
    title: 'Care & Conservation: Display and Humidity Basics',
    excerpt: 'Protecting paintings from UV and humidity is simple with a few practical habits for display and storage.',
    image: 'https://images.pexels.com/photos/564199/pexels-photo-564199.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    author: 'Materials Lab',
    date: '2025-05-28T09:45:00Z',
    category: 'Materials',
    tags: ['Conservation', 'Display', 'UV'],
    readTime: 9
  },
  {
    id: 'studio-lighting',
    title: 'Studio Lighting: Seeing True Color',
    excerpt: 'Neutral bulbs, CRI, and color temperature—how lighting choices affect what is seen and ultimately created.',
    image: 'https://images.pexels.com/photos/1858404/pexels-photo-1858404.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop',
    author: 'ArtistryStudio',
    date: '2025-05-12T16:00:00Z',
    category: 'Studio Notes',
    tags: ['Lighting', 'Color', 'Tools'],
    readTime: 5
  },
  {
    id: 'edition-vs-original',
    title: 'Edition vs. Original: What’s Right for You?',
    excerpt: 'Limited editions make collecting accessible. Learn how editions are made and what to look for in certificates.',
    image: 'https://images.unsplash.com/photo-1482062364825-616fd23b8fc1?auto=format&fit=crop&w=800&q=80',
    author: 'Curatorial Team',
    date: '2025-04-30T10:00:00Z',
    category: 'Collectors',
    tags: ['Editions', 'COA', 'Collecting'],
    readTime: 7
  }
];


const allCategories = ['All', ...Array.from(new Set(samplePosts.map(p => p.category)))];
const allTags = Array.from(new Set(samplePosts.flatMap(p => p.tags))).sort();

const BlogPage = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [tag, setTag] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
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
      case 'oldest': list.sort((a, b) => new Date(a.date) - new Date(b.date)); break;
      case 'readtime': list.sort((a, b) => a.readTime - b.readTime); break;
      default: list.sort((a, b) => new Date(b.date) - new Date(a.date));
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
    <div className="min-h-screen bg-linear-to-tr from-white via-gray-100 to-gray-200">
      {/* Featured Article */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="rounded-3xl overflow-hidden shadow-lg bg-white grid grid-cols-1 lg:grid-cols-2 border border-black/10">
            <div className="relative">
              <div className="aspect-video w-full h-full">
                <img src={featured.image} alt={featured.title} className="w-full h-full object-cover" />
              </div>
              <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>
            <div className="p-6 sm:p-10 flex flex-col">
              <span className="inline-block px-4 py-1 text-center rounded-full bg-white text-black border border-black mb-3 w-fit font-bold text-xs">{featured.category}</span>
              <h1 className="font-extrabold text-2xl mb-2 text-black">{featured.title}</h1>
              <p className="text-gray-600 mb-4 line-clamp-3">{featured.excerpt}</p>
              <div className="flex gap-5 flex-wrap text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1"><User size={16} />{featured.author}</span>
                <span className="flex items-center gap-1"><Calendar size={16} />{formatDate(featured.date)}</span>
                <span className="flex items-center gap-1"><Clock size={16} />{featured.readTime} min</span>
              </div>
              <div className="mt-auto">
                <Link
                  to={`/blog/${featured.id}`}
                  className="px-6 py-2 rounded-full font-bold bg-black text-white hover:bg-gray-900 transition inline-flex items-center gap-2 border border-black"
                >
                  Read Article <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main (Left) */}
          <div className="col-span-2">
            {/* Toolbar */}
            <div className="rounded-2xl shadow bg-white p-6 mb-8 flex flex-col md:flex-row md:items-center gap-4 justify-between border border-black/10">
              {/* Search */}
              <div className="w-full max-w-md">
                <div className="flex rounded-lg border border-black/20 overflow-hidden">
                  <span className="bg-white flex items-center px-3"><Search size={18} className="text-gray-400" /></span>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-white border-none outline-none text-sm text-black"
                    placeholder="Search posts, tags..."
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                  />
                </div>
              </div>
              {/* Sort */}
              <div className="flex items-center gap-2 whitespace-nowrap">
                <label className="text-gray-500 text-xs">Sort</label>
                <select
                  className="bg-white border border-black/20 rounded-lg px-3 py-2 text-sm text-black"
                  value={sortBy}
                  onChange={e => { setSortBy(e.target.value); setPage(1); }}
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="readtime">Shortest Read</option>
                </select>
              </div>
            </div>

            {/* Blog Card Grid */}
            {pagePosts.length === 0 ? (
              <div className="bg-white rounded-2xl shadow py-16 text-center border border-black/10">
                <div className="text-6xl mb-3">🖼️</div>
                <div className="text-gray-600">No posts match the current filters.</div>
              </div>
            ) : (
              <div className="grid gap-8 sm:grid-cols-2">
                {pagePosts.map((post, idx) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                  >
                    <article className="rounded-2xl shadow bg-white overflow-hidden flex flex-col h-full transition-all hover:shadow-xl border border-black/10">
                      <Link to={`/blog/${post.id}`} className="text-inherit no-underline flex flex-col h-full group">
                        <div className="aspect-video w-full bg-gray-200">
                          <img src={post.image} alt={post.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition" />
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                          <div className="flex gap-2 items-center mb-2">
                            <span className="px-2 py-0.5 rounded-full bg-white text-black border border-black text-xs font-bold">{post.category}</span>
                            <span className="hidden sm:flex items-center gap-1 text-gray-500 text-xs"><Calendar size={14} />{formatDate(post.date)}</span>
                            <span className="hidden sm:flex items-center gap-1 text-gray-500 text-xs"><Clock size={14} />{post.readTime} min</span>
                          </div>
                          <h3 className="font-bold text-sm mb-2 line-clamp-2 text-black">{post.title}</h3>
                          <p className="text-gray-600 mb-3 text-xs line-clamp-3">{post.excerpt}</p>
                          <div className="flex justify-between items-center mt-auto">
                            <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                              {post.tags.slice(0, 2).map(t => (
                                <span key={t} className="flex items-center gap-1"><Tag size={14} /> {t}</span>
                              ))}
                            </div>
                            <span className="flex items-center gap-1 text-black font-bold text-xs">
                              Read more <ChevronRight size={15} />
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
            <nav className="mt-8 flex justify-center items-center gap-2">
              <button
                className={`px-3 py-1 rounded-full font-bold border border-black/20 bg-white text-gray-500 ${currentPage === 1 ? 'opacity-50' : 'hover:bg-black hover:text-white'}`}
                disabled={currentPage === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  className={`px-3 py-1 rounded-full font-bold border border-black/20 bg-white text-gray-700 ${currentPage === n ? 'bg-black text-white border-black' : 'hover:bg-black hover:text-white'}`}
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>
              ))}
              <button
                className={`px-3 py-1 rounded-full font-bold border border-black/20 bg-white text-gray-500 ${currentPage === totalPages ? 'opacity-50' : 'hover:bg-black hover:text-white'}`}
                disabled={currentPage === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </nav>
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-7">
            <div className="bg-white rounded-2xl shadow p-6 border border-black/10">
              <h2 className="font-bold mb-4 text-lg text-black">Categories</h2>
              <div className="flex flex-col gap-2">
                {allCategories.map(c => (
                  <button
                    key={c}
                    className={`px-4 py-1 rounded-full font-bold border ${category === c ? 'bg-black text-white border-black' : 'bg-white text-black border-black/20 hover:bg-black hover:text-white'} transition`}
                    onClick={() => { setCategory(c); setPage(1); }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow p-6 border border-black/10">
              <h2 className="font-bold mb-4 text-lg text-black">Tags</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-3 py-1 rounded-full font-bold border ${tag === 'All' ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-black/20 hover:bg-black hover:text-white'} transition`}
                  onClick={() => { setTag('All'); setPage(1); }}
                >
                  All
                </button>
                {allTags.map(t => (
                  <button
                    key={t}
                    className={`px-3 py-1 rounded-full font-bold border ${tag === t ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-black/20 hover:bg-black hover:text-white'} transition`}
                    onClick={() => { setTag(t); setPage(1); }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow p-6 border border-black/10">
              <h2 className="font-bold mb-2 text-lg text-black">Subscribe</h2>
              <p className="text-gray-500 text-sm mb-2">Get new posts, studio news, and workshop dates.</p>
              <form className="flex gap-2">
                <input
                  className="flex-1 rounded-full border border-black/20 px-4 py-1 focus:ring-2 focus:ring-black text-sm"
                  type="email"
                  placeholder="Email address"
                />
                <button className="px-5 py-1 rounded-full bg-black text-white font-bold hover:bg-gray-900 transition">Join</button>
              </form>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};

export default BlogPage;
