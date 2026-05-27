/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "pub-6d50e72dcfe845d5b97f24b5ac57f161.r2.dev",
      },
    ],
  },

  async redirects() {
    return [
      {
        source: "/set-password",
        destination: "/login",
        permanent: false,
      },

      /*
        APAGADO DEFINITIVO DE FLUJOS VIEJOS
        Zona Norte y Vecinos ya no existen como experiencia separada.
        Todo vuelve a la tienda principal .com.
      */

      {
        source: "/zona-norte",
        destination: "/",
        permanent: true,
      },
      {
        source: "/zona-norte/:path*",
        destination: "/",
        permanent: true,
      },
      {
        source: "/vecinos",
        destination: "/",
        permanent: true,
      },
      {
        source: "/vecinos/:path*",
        destination: "/",
        permanent: true,
      },

      /*
        Limpieza por si quedaron links viejos con query params.
      */

      {
        source: "/checkout",
        has: [
          {
            type: "query",
            key: "source",
            value: "zona-norte",
          },
        ],
        destination: "/checkout",
        permanent: true,
      },
      {
        source: "/checkout",
        has: [
          {
            type: "query",
            key: "source",
            value: "vecinos",
          },
        ],
        destination: "/checkout",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
