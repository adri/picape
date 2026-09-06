import { Badge } from '../Badge/Badge';

const GRADE = { A: '#00823F', B: '#86BB2C', C: '#FECC02', D: '#EE8100', E: '#E73C09' };

// The supermarket grades a product A to E, answers "N/A" for the ones it does
// not grade, and leaves the property off entirely for most of the rest. Only a
// letter says anything, so anything else is not a badge with nothing in it, it
// is no badge. Exported for the screens that also have to drop the label or the
// spacing they put around one.
export function hasNutriscore(nutriscore) {
  return !!GRADE[nutriscore];
}

export function Nutriscore({ nutriscore }) {
  if (!hasNutriscore(nutriscore)) return null;

  return <Badge small amount={nutriscore} backgroundColor={GRADE[nutriscore]} />;
}
