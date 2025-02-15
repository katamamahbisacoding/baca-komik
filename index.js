import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [mangaList, setMangaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchManga = async () => {
      try {
        const res = await fetch(
          'https://api.mangadex.org/manga?limit=50&includes[]=cover_art&order[followedCount]=desc'
        );
        const { data } = await res.json();
        
        const formattedData = data.map(manga => {
          const cover = manga.relationships.find(r => r.type === "cover_art")?.attributes?.fileName;
          return {
            id: manga.id,
            title: manga.attributes.title.en || manga.attributes.title.ja || "Untitled",
            description: manga.attributes.description?.en || "No description available",
            status: manga.attributes.status,
            year: manga.attributes.year,
            rating: manga.attributes.contentRating,
            follows: manga.attributes.followsCount || 0, // Default value jika undefined
            cover: cover ? `https://uploads.mangadex.org/covers/${manga.id}/${cover}` : '/placeholder.jpg',
            tags: manga.attributes.tags.map(tag => tag.attributes.name.en)
          };
        });

        setMangaList(formattedData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching manga list:', error);
        setLoading(false);
      }
    };

    fetchManga();
  }, []);

  const filteredList = mangaList.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>Temukan Komik & Manhwa Terbaik</h1>
        <p className={styles.heroSubtitle}>Baca ribuan komik gratis dengan kualitas terbaik</p>
      </div>

      {/* Search Section */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Cari judul komik..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
        <svg className={styles.searchIcon} viewBox="0 0 24 24">
          <path d="M10 18a7.952 7.952 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8zm0-14c3.309 0 6 2.691 6 6s-2.691 6-6 6-6-2.691-6-6 2.691-6 6-6z"/>
        </svg>
      </div>

      {/* Trending Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>🔥 Trending Minggu Ini</h2>
        <div className={styles.trendingGrid}>
          {mangaList.slice(0, 5).map((item) => (
            <Link key={item.id} href={`/manga/${item.id}`} className={styles.trendingCard}>
              <img src={item.cover} alt={item.title} className={styles.trendingImage} />
              <div className={styles.trendingContent}>
                <h3>{item.title}</h3>
                <div className={styles.rating}>
                  <span>⭐ {item.follows?.toLocaleString() || 0} Pengikut</span>
                  <span>{item.rating}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* All Comics Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>📚 Semua Komik</h2>
        {loading ? (
          <div className={styles.loading}>Memuat...</div>
        ) : (
          <div className={styles.grid}>
            {filteredList.map((item) => (
              <Link key={item.id} href={`/manga/${item.id}`} className={styles.card}>
                <div className={styles.cardImage}>
                  <img src={item.cover} alt={item.title} loading="lazy" />
                  <div className={styles.cardBadge}>
                    <span>{item.status}</span>
                    {item.year && <span>{item.year}</span>}
                  </div>
                </div>
                <div className={styles.cardContent}>
                  <h3>{item.title}</h3>
                  <div className={styles.tags}>
                    {item.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className={styles.tag}>{tag}</span>
                    ))}
                  </div>
                  <div className={styles.stats}>
                    <span>⭐ {item.follows?.toLocaleString() || 0}</span>
                    <span>📖 {item.rating}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}