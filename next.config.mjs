
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // Lưu ý: Không điền API Key trực tiếp vào đây để tránh lộ code.
    // Next.js sẽ tự động đọc từ file .env.local
  },
};

export default nextConfig;
