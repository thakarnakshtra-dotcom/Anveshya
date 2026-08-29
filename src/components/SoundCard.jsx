import React from "react";

export default function SoundCard({ title, body, credit, date, type, src }) {
  return (
    <div className="sound-card">
      <div className="sound-card-body">
        {date ? <div className="mission-date">{date}</div> : null}
        <div className="sound-title">{title}</div>
        <div className="sound-desc">{body}</div>
      </div>
      <div className="sound-player">
        {type === "video" ? (
          <video controls preload="none" className="sound-media">
            <source src={src} />
          </video>
        ) : (
          <audio controls preload="none" className="sound-media">
            <source src={src} />
          </audio>
        )}
      </div>
      <div className="sound-credit">{credit}</div>
    </div>
  );
}
