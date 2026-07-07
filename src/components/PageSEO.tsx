import { Helmet } from "react-helmet-async";

interface PageSEOProps {
  title: string;
  description: string;
  path: string;
  type?: string;
  keywords?: string;
}

const BASE_URL = "https://scholarshine-connect.app";
const SITE_NAME = "Government Graduate College, Shahdara, Lahore";
const OG_IMAGE = "/favicon.ico";

const PageSEO = ({ title, description, path, type = "website", keywords }: PageSEOProps) => {
  const fullUrl = `${BASE_URL}${path}`;
  const fullTitle = path === "/" ? title : `${title} — ${SITE_NAME}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={fullUrl} />

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={OG_IMAGE} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={OG_IMAGE} />
    </Helmet>
  );
};

export default PageSEO;
