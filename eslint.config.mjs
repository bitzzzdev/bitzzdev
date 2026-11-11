import nextConfig from "eslint-config-next";

const config = [
  {
    ignores: ["public/**", ".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
  ...nextConfig,
];

export default config;
