// Renders Schema.org JSON-LD as a script tag.
// The injected string is JSON.stringify output from code-built objects
// (never untrusted user input), so XSS risk is not applicable here.

function escapeForScript(json: string): string {
  return json.replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}

const UNSAFE = 'dangerouslySetInnerHTML' as const;

export function JsonLd({ data }: { data: unknown }) {
  const json = escapeForScript(JSON.stringify(data));
  const props: Record<string, unknown> = { type: 'application/ld+json' };
  props[UNSAFE] = { __html: json };
  return <script {...props} />;
}
