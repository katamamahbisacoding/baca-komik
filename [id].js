import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../../styles/Home.module.css';

export default function MangaDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [manga, setManga] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ambil detail manga
        const mangaRes = await fetch(`https://api.mangadex.org/manga/${id}`);
        const mangaData = await mangaRes.json();
        
        // Ambil daftar chapter
        const chaptersRes = await fetch(
          `https://api.mangadex.org/manga/${id}/feed?order[chapter]=desc&translatedLanguage[]=en&contentRating[]=safe&contentRating[]=suggestive`
        );
        const chaptersData = await chaptersRes.json();

        // Proses data chapter
        const processedChapters = chaptersData.data
          .filter(chapter => chapter.attributes.pages > 0)
          .map(chapter => ({
            id: chapter.id,
            chapter: chapter.attributes.chapter,
            title: chapter.attributes.title,
            date: new Date(chapter.attributes.publishAt).toLocaleDateString(),
            pages: chapter.attributes.pages
          }));

        setManga(mangaData.data);
        setChapters(processedChapters);
        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  if (loading) return <div className={styles.container}>Memuat...</div>;
  if (!manga) return <div className={styles.container}>Komik tidak ditemukan</div>;

  // Cari data cover dengan optional chaining
  const coverArt = manga.relationships.find(r => r.type === "cover_art");
  const coverFileName = coverArt?.attributes?.fileName;
  const coverImageUrl = coverFileName
    ? `https://uploads.mangadex.org/covers/${id}/${coverFileName}`
    : '/fallback-image.jpg'; // Pastikan ada gambar fallback di folder public

  return (
    <div className={styles.detailContainer}>
      <button onClick={() => router.back()} className={styles.backButton}>
        ← Kembali
      </button>

      <div className={styles.mangaHeader}>
        <img
          src={coverImageUrl}
          alt={manga.attributes.title.en}
          className={styles.detailCover}
        />
        <div className={styles.mangaInfo}>
          <h1>{manga.attributes.title.en}</h1>
          <p className={styles.description}>
            {manga.attributes.description.en || "Deskripsi tidak tersedia"}
          </p>
          <div className={styles.metaData}>
            <span>Status: {manga.attributes.status}</span>
            <span>Rating: {manga.attributes.contentRating}</span>
          </div>
        </div>
      </div>

      <div className={styles.chapterSection}>
        <h2>Daftar Chapter</h2>
        <div className={styles.chapterGrid}>
          {chapters.map(chapter => (
            <Link
              key={chapter.id}
              href={`/read/${chapter.id}`}
              className={styles.chapterCard}
            >
              <div className={styles.chapterHeader}>
                <span className={styles.chapterNumber}>Chapter {chapter.chapter}</span>
                <span className={styles.pageCount}>{chapter.pages} Halaman</span>
              </div>
              {chapter.title && <p className={styles.chapterTitle}>{chapter.title}</p>}
              <div className={styles.chapterFooter}>
                <span className={styles.uploadDate}>📅 {chapter.date}</span>
                <button className={styles.readButton}>Baca Sekarang</button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
