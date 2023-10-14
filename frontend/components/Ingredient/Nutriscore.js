import { Badge } from '../Badge/Badge';

export function Nutriscore({ nutriscore }) {
  return (
    <Badge
      small
      amount={nutriscore}
      backgroundColor={
        { A: '#00823F', B: '#86BB2C', C: '#FECC02', D: '#EE8100', E: '#E73C09' }[nutriscore]
      }
    />
  );
}
