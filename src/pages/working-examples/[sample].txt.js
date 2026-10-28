import { workingExamples, exampleText } from '../../data/working-examples.mjs';
export function getStaticPaths() {
  return workingExamples.map((example) => ({
    params: { sample: example.slug },
    props: { example },
  }));
}
export function GET({ props }) {
  return new Response(exampleText(props.example), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
