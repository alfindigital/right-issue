import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>Halaman Tidak Ditemukan (404) - Kalkulator Right Issue IDX</title>
        <meta
          name="description"
          content="Halaman yang kamu cari tidak ditemukan. Kembali ke kalkulator Right Issue saham IDX."
        />
        <meta name="robots" content="noindex,follow" />
      </Helmet>
      <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </a>
      </div>
      </div>
    </>
  );
};

export default NotFound;
