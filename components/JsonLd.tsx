export default function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // "<" is escaped so arbitrary repo descriptions can never break out
      // of the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
