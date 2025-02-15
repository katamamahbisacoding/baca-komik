import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import styles from '../../styles/Home.module.css';

export default function ReadChapter() {
  const router = useRouter();
  const { chapterId } = router.query;
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const res = await fetch(
          `https://api.mangadex.org/at-home/server/${chapterId}`
        );
        const data = await res.json();
        setPages(data.chapter.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching pages:", error);
        setLoading(false);
      }
    };

    if (chapterId) fetchPages();
  }, [chapterId]);

  if (loading) return <div className={styles.container}>Memuat halaman...</div>;

  return (
    <div className={styles.container}>
      <button onClick={() => router.back()} className={styles.backButton}>
        Kembali
      </button>
      
      <div className={styles.readerContainer}>
        {pages.map((page, index) => (
          <img
            key={index}
            src={`https://uploads.mangadex.org/data/${pages.hash}/${page}`}
            alt={`Halaman ${index + 1}`}
            className={styles.comicPage}
          />
        ))}
      </div>
      
      <div className={styles.pagination}>
        <button
          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
        >
          Sebelumnya
        </button>
        <span>Halaman {currentPage + 1} dari {pages.length}</span>
        <button
          onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPage + 1))}
          disabled={currentPage === pages.length - 1}
        >
          Berikutnya
        </button>
      </div>
    </div>
  );
}