interface PageProps {
  params: { id: string };
}

export default function Page({ params }: PageProps) {
  return <p>ID: {params.id}</p>;
}