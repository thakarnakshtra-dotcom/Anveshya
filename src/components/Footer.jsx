import React from "react";
import { Link } from "react-router-dom";

const CONTACT_EMAIL = "anveshya.space@gmail.com";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-column">
          <h3 className="footer-heading">ANVESHYA</h3>
          <p className="footer-tagline">Interactive space exploration and astronomy education platform</p>
          <p className="footer-description">
            Real orbital mechanics, NASA imagery, live space weather intelligence, and ancient Indian
            astronomical knowledge.
          </p>
          <div className="footer-social">
            <a href="https://www.linkedin.com/in/nakshtra-thakar" target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          </div>
        </div>

        <div className="footer-column">
          <h4 className="footer-subheading">Product</h4>
          <ul className="footer-links">
            <li>
              <Link to="/explorer">Explorer</Link>
            </li>
            <li>
              <Link to="/learn">Learn</Link>
            </li>
            <li>
              <Link to="/solarshield">SolarShield</Link>
            </li>
            <li>
              <Link to="/news">News &amp; Events</Link>
            </li>
            <li>
              <a href="https://solarsheildai.netlify.app/" target="_blank" rel="noopener noreferrer">
                Live Dashboard
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-column">
          <h4 className="footer-subheading">Resources</h4>
          <ul className="footer-links">
            <li>
              <a href="https://www.nasa.gov" target="_blank" rel="noopener noreferrer">
                NASA
              </a>
            </li>
            <li>
              <a href="https://www.isro.gov.in" target="_blank" rel="noopener noreferrer">
                ISRO
              </a>
            </li>
            <li>
              <a href="https://www.esa.int" target="_blank" rel="noopener noreferrer">
                ESA
              </a>
            </li>
            <li>
              <a href="https://www.jaxa.jp" target="_blank" rel="noopener noreferrer">
                JAXA
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-column">
          <h4 className="footer-subheading">Company</h4>
          <ul className="footer-links">
            <li>
              <Link to="/about">About Us</Link>
            </li>
            <li>
              <a href={`mailto:${CONTACT_EMAIL}`}>Contact: {CONTACT_EMAIL}</a>
            </li>
            <li>
              <Link to="/privacy">Privacy Policy</Link>
            </li>
            <li>
              <Link to="/terms">Terms of Service</Link>
            </li>
            <li>
              <button
                type="button"
                className="footer-feedback-link"
                onClick={() => window.dispatchEvent(new CustomEvent("anveshya:open-feedback"))}
              >
                Feedback
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 Anveshya. Built by Nakshtra Thakar. Based in Surat, India.</p>
        <p>Space exploration for everyone &mdash; from students to satellite operators.</p>
      </div>
    </footer>
  );
}
