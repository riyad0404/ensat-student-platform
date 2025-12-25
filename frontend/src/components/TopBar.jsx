import React from "react";
import "../styles/TopBar.css";

const TopBar = ({ onAddPost }) => {
  return (
    <div className="topbar">
      <input
        type="text"
        placeholder="Search for friends, groups, pages"
        className="search-input"
      />
      <button 
        className="add-post-btn"
        onClick={onAddPost}
      >
        + Add New Post
      </button>
    </div>
  );
};

export default TopBar;