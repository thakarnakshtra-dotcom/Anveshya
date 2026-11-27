import React from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import LabRunner from "../labs/shell/LabRunner.jsx";

// /labs/<slug> on the website: the same full-screen lab the app embeds.
// "?experiment=<id>" opens the lab on that experiment.
export default function Lab() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  return (
    <LabRunner
      key={slug}
      slug={slug}
      experiment={searchParams.get("experiment")}
      onClose={() => navigate("/explorer?section=labs")}
    />
  );
}
