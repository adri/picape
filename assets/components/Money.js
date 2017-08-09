export default ({ price }) =>
  <div>
    &euro;{(price / 100).toFixed(2)}
    <style jsx>{``}</style>
  </div>;
