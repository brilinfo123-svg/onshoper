import Head from "next/head";

export default function SEO() {
  const title = "OnShoper - Buy, Sell & Rent Everything Online in India";
  const description = "OnShoper is India's marketplace to buy, sell and rent products online. Find mobiles, cars, bikes, electronics, furniture, properties and more with easy listings.";

  const url = "https://onshoper.com/";
  const image = "https://onshoper.com/images/ogImage.jpg";

  return (
    <Head>
      {/* Basic SEO */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index,follow,max-image-preview:large" />
      <link rel="canonical" href={url} />

      {/* Mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="UTF-8" />
      <meta name="theme-color" content="#ffffff" />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="OnShoper" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content="OnShoper Marketplace" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* App */}
      <link rel="manifest" href="/manifest.json" />
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/images/apple-touch-icon.png" />
    </Head>
  );
}
