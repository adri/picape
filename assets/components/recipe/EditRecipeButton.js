import Link from 'next/link';

export default function({recipeId}) {
  return (
    <Link href={`/recipe?id=${recipeId}`}>
      <a>edit</a>
    </Link>
  );
}

