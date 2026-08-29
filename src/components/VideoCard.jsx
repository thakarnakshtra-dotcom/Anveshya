import React from "react";

export default function VideoCard({ title, videoId, category, credit, body }) {
  return (
    <div className="video-card">
      <div className="video-embed">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}`}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
      <div className="video-body">
        <div className="mission-meta">
          <span className="agency-badge video-category-badge">{category}</span>
        </div>
        <div className="mission-title">{title}</div>
        {body ? <div className="mission-desc">{body}</div> : null}
        <div className="mission-credit">Source: {credit}</div>
      </div>
    </div>
  );
}
