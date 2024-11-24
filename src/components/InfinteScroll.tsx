import { useEffect, useRef, useState } from 'react';

type Post = {
  id: number;
  title: string;
  url: string; // Updated to match the API structure
};

export const InfiniteScroll = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true); // To handle end of data

  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    async function getPosts() {
      setIsLoading(true);
      try {
        const rawResponse = await fetch(
          `https://jsonplaceholder.typicode.com/photos?_page=${page}&_limit=10`
        );
        const postsRes: Post[] = await rawResponse.json();
        if (postsRes.length === 0) {
          setHasMore(false); // Stop fetching if no more data
        } else {
          setPosts((prevPosts) => [...prevPosts, ...postsRes]);
        }
      } catch (err) {
        console.error('Failed to fetch posts:', err);
      } finally {
        setIsLoading(false);
      }
    }
    if (hasMore) {
      getPosts();
    }
  }, [page, hasMore]);

  const bottomElement = (node: HTMLDivElement) => {
    if (isLoading || !hasMore) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPage((prev) => prev + 1);
      }
    });

    if (node) observer.current.observe(node);
  };

  return (
    <div>
      {posts.map((post) => (
        <div
          key={post.id}
          style={{
            border: '1px solid grey',
            padding: '10px',
            margin: '10px',
          }}
        >
          <h1>{post.title}</h1>
          <img
            src={post.url}
            alt={post.title}
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>
      ))}
      {isLoading && <p>Loading...</p>}
      {!hasMore && <p>No more posts to load.</p>}
      <div ref={bottomElement} style={{ height: '20px' }}></div>
    </div>
  );
};
