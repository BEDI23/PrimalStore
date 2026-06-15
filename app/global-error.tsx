"use client";

import { useEffect } from "react";

// global-error remplace le layout racine : il doit fournir <html> et <body>,
// et ne peut pas dépendre des styles globaux → styles inline.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="fr">
      <body
        style={{
          fontFamily: "Inter, Arial, sans-serif",
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "24px",
          margin: 0,
          color: "#111",
        }}
      >
        <h1 style={{ fontSize: "22px", fontWeight: 700 }}>
          Une erreur est survenue
        </h1>
        <p style={{ marginTop: "8px", color: "#6b7280", maxWidth: "28rem" }}>
          Désolé, quelque chose s&apos;est mal passé. Vous pouvez réessayer.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: "24px",
            borderRadius: "8px",
            backgroundColor: "#16a34a",
            color: "#fff",
            padding: "10px 20px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Réessayer
        </button>
      </body>
    </html>
  );
}
