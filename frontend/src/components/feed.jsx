import PostCard from "./Postcard";
import "../styles/feed.css";

const Feed = ({ posts = [] }) => {
  return (
    <div className="feed">
      {posts.map(post => (
        <PostCard key={post.idpost || post.id} post={post} />
      ))}
    </div>
  );
};

export default Feed;